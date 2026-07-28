import type { Order, Prisma, PrismaClient } from '@prisma/client';
import type { IOrderRepository, OrderWithRelations } from './order.types.js';
import type { PaginatedResult, PaginationParams } from '../../shared/types/index.js';
import { PAGINATION } from '../../config/constants.js';

/**
 * Order repository implementation
 */
export class OrderRepository implements IOrderRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private get includeRelations(): Prisma.OrderInclude {
    return {
      items: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
      payment: true,
      refundRequest: true,
    };
  }

  async create(data: {
    orderNumber: string;
    userId: string;
    subtotal: number;
    discount: number;
    shippingCharge: number;
    total: number;
    addressSnapshot: Record<string, unknown>;
    couponId?: string;
    couponCode?: string;
    items: Array<{
      productId: string;
      productSnapshot: Record<string, unknown>;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      customization?: Record<string, unknown>;
    }>;
  }): Promise<OrderWithRelations> {
    const order = await this.prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        subtotal: data.subtotal,
        discount: data.discount,
        shippingCharge: data.shippingCharge,
        total: data.total,
        addressSnapshot: data.addressSnapshot as Prisma.InputJsonObject,
        couponId: data.couponId,
        couponCode: data.couponCode,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productSnapshot: item.productSnapshot as Prisma.InputJsonObject,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            customization: item.customization as Prisma.InputJsonObject | undefined,
          })),
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'Order placed',
          },
        },
      },
      include: this.includeRelations,
    });

    return order as OrderWithRelations;
  }

  async findById(id: string): Promise<OrderWithRelations | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: this.includeRelations,
    }) as Promise<OrderWithRelations | null>;
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderWithRelations | null> {
    return this.prisma.order.findUnique({
      where: { orderNumber },
      include: this.includeRelations,
    }) as Promise<OrderWithRelations | null>;
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<OrderWithRelations>> {
    const limit = Math.min(pagination.limit, PAGINATION.MAX_PAGE_SIZE);

    const cursorCondition = pagination.cursor
      ? { id: { gt: pagination.cursor } }
      : {};

    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        ...cursorCondition,
      },
      take: limit + 1,
      orderBy: { placedAt: 'desc' },
      include: this.includeRelations,
    });

    const hasMore = orders.length > limit;
    const data = hasMore ? orders.slice(0, limit) : orders;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return {
      data: data as OrderWithRelations[],
      nextCursor,
      hasMore,
    };
  }

  async updateStatus(id: string, status: string, note?: string, changedBy?: string): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      // Update order status
      const order = await tx.order.update({
        where: { id },
        data: { status: status as Order['status'] },
      });

      // Add status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: status as Order['status'],
          note,
          changedBy,
        },
      });

      return order;
    });
  }

  async updatePayment(id: string, paymentId: string): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: {
        paymentId,
        status: 'PAID',
        paidAt: new Date(),
      },
    });
  }

  async reserveStock(productId: string, quantity: number): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE products 
      SET stock = stock - ${quantity}
      WHERE id = ${productId}::uuid AND stock >= ${quantity}
    `;
  }

  async releaseStock(productId: string, quantity: number): Promise<void> {
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: { increment: quantity },
      },
    });
  }

  async deductStock(productId: string, quantity: number): Promise<void> {
    // Stock was already reserved, no need to deduct again
    // This is called after successful payment to confirm the deduction
  }
}
