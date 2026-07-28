/**
 * Admin service implementation
 */

import type {
  IAdminService,
  IAdminRepository,
  DashboardStats,
  AnalyticsData,
  TopProduct,
  CustomerListItem,
  CustomerDetail,
  OrderListItem,
  UpdateOrderStatusInput,
  AddTrackingInput,
  RefundListItem,
  ProcessRefundInput,
} from './admin.types.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import { OrderStatus } from '@prisma/client';

export class AdminService implements IAdminService {
  private readonly repository: IAdminRepository;

  constructor(repository: IAdminRepository) {
    this.repository = repository;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.repository.getDashboardStats();
  }

  async getAnalytics(period: string, startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    let calculatedStartDate: Date;
    let calculatedEndDate: Date;

    const now = new Date();

    switch (period) {
      case 'today': {
        calculatedStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        calculatedEndDate = now;
        break;
      }
      case 'week': {
        calculatedStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        calculatedEndDate = now;
        break;
      }
      case 'month': {
        calculatedStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        calculatedEndDate = now;
        break;
      }
      case 'year': {
        calculatedStartDate = new Date(now.getFullYear(), 0, 1);
        calculatedEndDate = now;
        break;
      }
      case 'custom': {
        if (!startDate || !endDate) {
          throw new BadRequestError('Custom period requires startDate and endDate');
        }
        calculatedStartDate = startDate;
        calculatedEndDate = endDate;
        break;
      }
      default: {
        calculatedStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        calculatedEndDate = now;
      }
    }

    return this.repository.getAnalytics(calculatedStartDate, calculatedEndDate);
  }

  async getTopProducts(limit?: number, startDate?: Date, endDate?: Date): Promise<TopProduct[]> {
    return this.repository.getTopProducts(limit ?? 10, startDate, endDate);
  }

  async getCustomers(options: { page: number; limit: number; search?: string }): Promise<{ customers: CustomerListItem[]; total: number }> {
    return this.repository.getCustomers(options);
  }

  async getCustomerById(id: string): Promise<CustomerDetail> {
    const customer = await this.repository.getCustomerById(id);
    if (!customer) {
      throw new NotFoundError('Customer');
    }
    return customer;
  }

  async getOrders(options: {
    page: number;
    limit: number;
    status?: OrderStatus;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ orders: OrderListItem[]; total: number }> {
    return this.repository.getOrders(options);
  }

  async getOrderById(id: string): Promise<unknown> {
    const order = await this.repository.getOrderById(id);
    if (!order) {
      throw new NotFoundError('Order');
    }
    return order;
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusInput, adminId: string): Promise<unknown> {
    const order = await this.repository.getOrderById(id);
    if (!order) {
      throw new NotFoundError('Order');
    }

    // Validate status transition
    const typedOrder = order as { status: OrderStatus };
    this.validateStatusTransition(typedOrder.status, data.status);

    const updated = await this.repository.updateOrderStatus(id, data.status, data.note, adminId);

    logger.info({ orderId: id, newStatus: data.status, adminId }, 'Order status updated by admin');

    return updated;
  }

  async addTrackingToOrder(id: string, data: AddTrackingInput): Promise<unknown> {
    const order = await this.repository.getOrderById(id);
    if (!order) {
      throw new NotFoundError('Order');
    }

    const updated = await this.repository.addTrackingToOrder(id, data.awbCode, data.trackingUrl);

    logger.info({ orderId: id, awbCode: data.awbCode }, 'Tracking added to order');

    return updated;
  }

  async getRefunds(options: { page: number; limit: number; status?: import('@prisma/client').RefundStatus }): Promise<{ refunds: RefundListItem[]; total: number }> {
    return this.repository.getRefunds(options);
  }

  async processRefund(id: string, data: ProcessRefundInput): Promise<unknown> {
    const refund = await this.repository.getRefundById(id);
    if (!refund) {
      throw new NotFoundError('Refund request');
    }

    if (refund.status !== 'PENDING') {
      throw new BadRequestError('Refund has already been processed');
    }

    const updated = await this.repository.processRefund(id, data.status, data.adminNote);

    logger.info({ refundId: id, status: data.status }, 'Refund processed by admin');

    return updated;
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    // Define valid transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['PAID', 'PROCESSING', 'CANCELLED'],
      PAID: ['PROCESSING', 'SHIPPED', 'CANCELLED', 'REFUNDED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: [],
    };

    const allowed = validTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
