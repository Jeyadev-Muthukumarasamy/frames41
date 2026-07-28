import { customAlphabet } from 'nanoid';
import { Prisma } from '@prisma/client';
import type { OrderData, IOrderRepository, IOrderService } from './order.types.js';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import type { PricingEngine } from '../cart/pricing.engine.js';
import type { PaginatedResult } from '../../shared/types/index.js';
import { CouponService } from '../coupon/coupon.service.js';

// Generate order number: F41-XXXXXX (alphanumeric)
const generateOrderNumber = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

/**
 * Order service implementation
 */
export class OrderService implements IOrderService {
  private readonly repository: IOrderRepository;
  private readonly pricingEngine: typeof PricingEngine;
  private readonly couponService: CouponService;

  constructor(
    repository: IOrderRepository,
    pricingEngine: typeof PricingEngine,
    couponService = new CouponService(),
  ) {
    this.repository = repository;
    this.pricingEngine = pricingEngine;
    this.couponService = couponService;
  }

  async createOrder(
    userId: string,
    data: { addressId: string; couponCode?: string },
  ): Promise<OrderData> {
    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
              variant: true,
            },
          },
        },
      });
      if (!cart || cart.items.length === 0) throw new BadRequestError('Cart is empty');

      const address = await tx.address.findFirst({ where: { id: data.addressId, userId } });
      if (!address) throw new NotFoundError('Address');

      const pricingItems = cart.items.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        basePrice: Number(item.unitPrice),
        priceTiers: [],
      }));
      const subtotal = this.pricingEngine.calculateSubtotal(
        this.pricingEngine.calculateItems(pricingItems),
      );

      let couponId: string | undefined;
      let coupon = null;
      if (data.couponCode?.trim()) {
        const validation = await this.couponService.validateCoupon(
          data.couponCode,
          userId,
          subtotal,
          tx,
        );
        if (!validation.valid || !validation.couponId) {
          throw new BadRequestError(validation.message ?? 'Invalid coupon code');
        }
        couponId = validation.couponId;
        coupon = {
          code: validation.code,
          type: validation.type,
          value: validation.value,
          minOrderValue: validation.minOrderValue,
          maxDiscount: validation.maxDiscount,
        };
      }

      const calculation = this.pricingEngine.calculateCart(
        pricingItems,
        coupon,
        address.state,
        true,
      );

      const quantityByProduct = new Map<string, number>();
      for (const item of cart.items) {
        quantityByProduct.set(
          item.productId,
          (quantityByProduct.get(item.productId) ?? 0) + item.quantity,
        );
      }
      for (const [productId, quantity] of quantityByProduct) {
        const updated = await tx.$executeRaw`
          UPDATE products
          SET stock = stock - ${quantity}
          WHERE id = ${productId}::uuid AND stock >= ${quantity}
        `;
        if (updated !== 1) {
          const item = cart.items.find((candidate) => candidate.productId === productId);
          throw new BadRequestError(`Insufficient stock for ${item?.product.name ?? 'product'}`);
        }
      }

      const orderNumber = `F41-${generateOrderNumber()}`;
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal: calculation.subtotal,
          discount: calculation.couponDiscount,
          shippingCharge: calculation.shippingCharge,
          total: calculation.total,
          addressSnapshot: {
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          },
          couponId,
          couponCode: calculation.couponCode,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productSnapshot: {
                name: item.product.name,
                slug: item.product.slug,
                image: item.product.images[0]?.url,
                sku: item.product.sku,
              },
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              customization: {
                ...(item.customization &&
                typeof item.customization === 'object' &&
                !Array.isArray(item.customization)
                  ? item.customization
                  : {}),
                ...(item.customImageUrl ? { customImageUrl: item.customImageUrl } : {}),
              },
            })),
          },
          statusHistory: { create: { status: 'PENDING', note: 'Order placed' } },
        },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
          payment: true,
          refundRequest: true,
        },
      });

      if (couponId) {
        await tx.couponRedemption.create({
          data: { couponId, userId, orderId: createdOrder.id },
        });
      }
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return createdOrder;
    }, {
      isolationLevel: 'Serializable',
      maxWait: 10_000,
      timeout: 20_000,
    }).catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new ConflictError(
          'Checkout changed while your order was being placed. Please review and try again.',
          'CHECKOUT_CONFLICT',
        );
      }
      throw error;
    });

    logger.info({ orderId: order.id, orderNumber: order.orderNumber }, 'Order created');
    return this.mapOrderToData(order);
  }

  async getOrderById(orderId: string, userId: string, userRole: string): Promise<OrderData> {
    const order = await this.repository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Check authorization
    if (order.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    return this.mapOrderToData(order);
  }

  async getOrderByNumber(
    orderNumber: string,
    userId: string,
    userRole: string,
  ): Promise<OrderData> {
    const order = await this.repository.findByOrderNumber(orderNumber);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Check authorization
    if (order.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    return this.mapOrderToData(order);
  }

  async getUserOrders(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<PaginatedResult<OrderData>> {
    const result = await this.repository.findByUserId(userId, { cursor, limit });

    return {
      data: result.data.map((order) => this.mapOrderToData(order)),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  async updateOrderStatus(
    orderId: string,
    data: { status: string; note?: string },
    adminId: string,
  ): Promise<OrderData> {
    const order = await this.repository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    const updatedOrder = await this.repository.updateStatus(
      orderId,
      data.status,
      data.note,
      adminId,
    );

    logger.info({ orderId, status: data.status }, 'Order status updated');

    // Fetch updated order with relations
    const fullOrder = await this.repository.findById(orderId);
    return this.mapOrderToData(fullOrder!);
  }

  async requestRefund(
    userId: string,
    orderId: string,
    data: { reason: string; videoUrl?: string },
  ): Promise<void> {
    const order = await this.repository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.userId !== userId) {
      throw new ForbiddenError('You do not have permission to request refund for this order');
    }

    if (order.status !== 'DELIVERED') {
      throw new BadRequestError('Refund can only be requested for delivered orders');
    }

    if (order.refundRequest) {
      throw new BadRequestError('Refund request already exists for this order');
    }

    await prisma.refundRequest.create({
      data: {
        orderId,
        userId,
        reason: data.reason,
        videoUrl: data.videoUrl,
        status: 'PENDING',
      },
    });

    logger.info({ orderId, userId }, 'Refund request created');
  }

  async cancelOrder(userId: string, orderId: string): Promise<void> {
    const order = await this.repository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.userId !== userId) {
      throw new ForbiddenError('You do not have permission to cancel this order');
    }

    if (order.status !== 'PENDING' && order.status !== 'PAID') {
      throw new BadRequestError('Order cannot be cancelled at this stage');
    }

    // Release stock for all items
    await Promise.all(
      order.items.map((item) => this.repository.releaseStock(item.productId, item.quantity)),
    );

    await this.repository.updateStatus(orderId, 'CANCELLED', 'Order cancelled by user');

    logger.info({ orderId }, 'Order cancelled');
  }

  private mapOrderToData(order: {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: { toString(): string } | number;
    discount: { toString(): string } | number;
    shippingCharge: { toString(): string } | number;
    total: { toString(): string } | number;
    addressSnapshot: unknown;
    couponCode?: string | null;
    items: Array<{
      id: string;
      productId: string;
      productSnapshot: unknown;
      quantity: number;
      unitPrice: { toString(): string } | number;
      totalPrice: { toString(): string } | number;
      customization?: unknown;
    }>;
    payment?: {
      status: string;
      method?: string | null;
      razorpayOrderId: string;
    } | null;
    placedAt: Date;
    paidAt?: Date | null;
    shippedAt?: Date | null;
    deliveredAt?: Date | null;
  }): OrderData {
    const address = order.addressSnapshot as Record<string, string>;
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingCharge: Number(order.shippingCharge),
      total: Number(order.total),
      addressSnapshot: {
        line1: address.line1 ?? '',
        line2: address.line2,
        city: address.city ?? '',
        state: address.state ?? '',
        pincode: address.pincode ?? '',
      },
      couponCode: order.couponCode ?? undefined,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: String((item.productSnapshot as Record<string, unknown>)?.name || ''),
        productImage: String((item.productSnapshot as Record<string, unknown>)?.image || ''),
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        customization: item.customization as Record<string, unknown> | undefined,
      })),
      payment: order.payment
        ? {
            status: order.payment.status,
            method: order.payment.method ?? undefined,
            razorpayOrderId: order.payment.razorpayOrderId,
          }
        : undefined,
      placedAt: order.placedAt.toISOString(),
      paidAt: order.paidAt?.toISOString(),
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
    };
  }
}
