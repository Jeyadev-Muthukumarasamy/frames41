/**
 * Admin repository implementation
 */

import type { PrismaClient, OrderStatus, RefundStatus } from '@prisma/client';
import type {
  IAdminRepository,
  DashboardStats,
  AnalyticsData,
  TopProduct,
  CustomerListItem,
  CustomerDetail,
  OrderListItem,
  RefundListItem,
} from './admin.types.js';

export class AdminRepository implements IAdminRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      lowStockProducts,
      pendingReviews,
      pendingRefunds,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.order.count({ where: { placedAt: { gte: today } } }),
      this.prisma.order.aggregate({
        where: { placedAt: { gte: today }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'PROCESSING' } }),
      this.prisma.order.count({ where: { status: 'SHIPPED' } }),
      this.prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }),
      this.prisma.review.count({ where: { isApproved: false } }),
      this.prisma.refundRequest.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.total ?? 0),
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.total ?? 0),
      pendingOrders,
      processingOrders,
      shippedOrders,
      lowStockProducts,
      pendingReviews,
      pendingRefunds,
    };
  }

  async getAnalytics(startDate: Date, endDate: Date): Promise<AnalyticsData> {
    const [ordersAgg, uniqueCustomers] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          placedAt: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
      this.prisma.order.groupBy({
        by: ['userId'],
        where: {
          placedAt: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' },
        },
        _count: { userId: true },
      }),
    ]);

    const gmv = Number(ordersAgg._sum.total ?? 0);
    const totalOrders = ordersAgg._count.id;
    const aov = totalOrders > 0 ? gmv / totalOrders : 0;

    // Conversion rate: orders / (orders + abandoned cart triggers in period)
    // Simplified: orders / total website visitors estimate (use orders * 10 as proxy)
    const conversionRate = totalOrders > 0 ? Math.min((totalOrders / (totalOrders * 10)) * 100, 100) : 0;

    return {
      gmv,
      aov,
      totalOrders,
      conversionRate: Number(conversionRate.toFixed(2)),
      period: `${startDate.toISOString()}_${endDate.toISOString()}`,
    };
  }

  async getTopProducts(limit: number, startDate?: Date, endDate?: Date): Promise<TopProduct[]> {
    const where: Record<string, unknown> = {};
    if (startDate && endDate) {
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const items = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where,
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return items.map((item) => {
      const product = productMap.get(item.productId);
      return {
        id: item.productId,
        name: product?.name ?? 'Unknown Product',
        slug: product?.slug ?? '',
        totalSold: Number(item._sum.quantity ?? 0),
        totalRevenue: Number(item._sum.totalPrice ?? 0),
      };
    });
  }

  async getCustomers(options: { page: number; limit: number; search?: string }): Promise<{ customers: CustomerListItem[]; total: number }> {
    const skip = (options.page - 1) * options.limit;

    const where: Record<string, unknown> = {};
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true } },
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { total: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const mappedCustomers = customers.map((user) => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      totalOrders: user._count.orders,
      totalSpent: user.orders.reduce((sum, order) => sum + Number(order.total), 0),
      createdAt: user.createdAt,
    }));

    return { customers: mappedCustomers, total };
  }

  async getCustomerById(id: string): Promise<CustomerDetail | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { placedAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            placedAt: true,
          },
        },
        addresses: {
          select: {
            id: true,
            line1: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
        _count: { select: { orders: true } },
      },
    });

    if (!user) return null;

    const totalSpent = user.orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, order) => sum + Number(order.total), 0);

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      totalOrders: user._count.orders,
      totalSpent,
      createdAt: user.createdAt,
      orders: user.orders.map((order) => ({ ...order, total: Number(order.total) })),
      addresses: user.addresses,
    };
  }

  async getOrders(options: {
    page: number;
    limit: number;
    status?: OrderStatus;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ orders: OrderListItem[]; total: number }> {
    const skip = (options.page - 1) * options.limit;

    const where: Record<string, unknown> = {};
    if (options.status) where.status = options.status;
    if (options.startDate && options.endDate) {
      where.placedAt = { gte: options.startDate, lte: options.endDate };
    }
    if (options.search) {
      where.OR = [
        { orderNumber: { contains: options.search, mode: 'insensitive' } },
        { user: { name: { contains: options.search, mode: 'insensitive' } } },
        { user: { phone: { contains: options.search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { placedAt: 'desc' },
        include: {
          user: { select: { name: true, phone: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const mappedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      userName: order.user.name,
      userPhone: order.user.phone,
      status: order.status,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingCharge: Number(order.shippingCharge),
      total: Number(order.total),
      placedAt: order.placedAt,
      itemCount: order._count.items,
    }));

    return { orders: mappedOrders, total };
  }

  async getOrderById(id: string): Promise<unknown | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        payment: true,
        refundRequest: true,
      },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus, note?: string, changedBy?: string): Promise<unknown> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note,
          changedBy,
        },
      });

      return order;
    });
  }

  async addTrackingToOrder(id: string, awbCode: string, trackingUrl?: string): Promise<unknown> {
    return this.prisma.order.update({
      where: { id },
      data: {
        awbCode,
        trackingUrl,
      },
    });
  }

  async getRefunds(options: { page: number; limit: number; status?: RefundStatus }): Promise<{ refunds: RefundListItem[]; total: number }> {
    const skip = (options.page - 1) * options.limit;

    const where: Record<string, unknown> = {};
    if (options.status) where.status = options.status;

    const [refunds, total] = await Promise.all([
      this.prisma.refundRequest.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          user: { select: { name: true, phone: true } },
          order: { select: { orderNumber: true } },
        },
      }),
      this.prisma.refundRequest.count({ where }),
    ]);

    const mappedRefunds = refunds.map((refund) => ({
      id: refund.id,
      orderId: refund.orderId,
      orderNumber: refund.order.orderNumber,
      userId: refund.userId,
      userName: refund.user.name,
      userPhone: refund.user.phone,
      reason: refund.reason,
      videoUrl: refund.videoUrl,
      status: refund.status,
      requestedAt: refund.requestedAt,
    }));

    return { refunds: mappedRefunds, total };
  }

  async getRefundById(id: string): Promise<RefundListItem | null> {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, phone: true } },
        order: { select: { orderNumber: true, total: true, status: true } },
      },
    });

    if (!refund) return null;

    return {
      id: refund.id,
      orderId: refund.orderId,
      orderNumber: refund.order.orderNumber,
      userId: refund.userId,
      userName: refund.user.name,
      userPhone: refund.user.phone,
      reason: refund.reason,
      videoUrl: refund.videoUrl,
      status: refund.status,
      requestedAt: refund.requestedAt,
    };
  }

  async processRefund(id: string, status: RefundStatus, adminNote?: string): Promise<unknown> {
    return this.prisma.refundRequest.update({
      where: { id },
      data: {
        status,
        adminNote,
        processedAt: new Date(),
      },
    });
  }

  async getPendingReviewsCount(): Promise<number> {
    return this.prisma.review.count({ where: { isApproved: false } });
  }

  async getLowStockProducts(threshold: number): Promise<unknown[]> {
    return this.prisma.product.findMany({
      where: {
        stock: { lte: threshold },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        basePrice: true,
      },
      orderBy: { stock: 'asc' },
    });
  }
}
