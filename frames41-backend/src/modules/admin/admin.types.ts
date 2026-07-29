/**
 * Admin types
 */

import type { OrderStatus, RefundStatus } from '@prisma/client';

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  lowStockProducts: number;
  pendingReviews: number;
  pendingRefunds: number;
}

export interface AnalyticsData {
  gmv: number;
  aov: number;
  totalOrders: number;
  conversionRate: number;
  period: string;
}

export interface TopProduct {
  id: string;
  name: string;
  slug: string;
  totalSold: number;
  totalRevenue: number;
}

export interface CustomerListItem {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
}

export interface CustomerDetail extends CustomerListItem {
  orders: Array<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
    placedAt: Date;
  }>;
  addresses: Array<{
    id: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  }>;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string | null;
  userPhone: string | null;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  placedAt: Date;
  itemCount: number;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  note?: string;
}

export interface AddTrackingInput {
  awbCode: string;
  trackingUrl?: string;
}

export interface RefundListItem {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userName: string | null;
  userPhone: string | null;
  reason: string;
  videoUrl: string | null;
  status: RefundStatus;
  requestedAt: Date;
}

export interface ProcessRefundInput {
  status: RefundStatus;
  adminNote?: string;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}

export interface IAdminRepository {
  getDashboardStats(): Promise<DashboardStats>;
  getAnalytics(startDate: Date, endDate: Date): Promise<AnalyticsData>;
  getTopProducts(limit: number, startDate?: Date, endDate?: Date): Promise<TopProduct[]>;
  getCustomers(options: { page: number; limit: number; search?: string }): Promise<{ customers: CustomerListItem[]; total: number }>;
  getCustomerById(id: string): Promise<CustomerDetail | null>;
  getOrders(options: { page: number; limit: number; status?: OrderStatus; search?: string; startDate?: Date; endDate?: Date }): Promise<{ orders: OrderListItem[]; total: number }>;
  getOrderById(id: string): Promise<unknown | null>;
  updateOrderStatus(id: string, status: OrderStatus, note?: string, changedBy?: string): Promise<unknown>;
  addTrackingToOrder(id: string, awbCode: string, trackingUrl?: string): Promise<unknown>;
  getRefunds(options: { page: number; limit: number; status?: RefundStatus }): Promise<{ refunds: RefundListItem[]; total: number }>;
  getRefundById(id: string): Promise<RefundListItem | null>;
  processRefund(id: string, status: RefundStatus, adminNote?: string): Promise<unknown>;
  getPendingReviewsCount(): Promise<number>;
  getLowStockProducts(threshold: number): Promise<unknown[]>;
}

export interface IAdminService {
  getDashboardStats(): Promise<DashboardStats>;
  getAnalytics(period: string, startDate?: Date, endDate?: Date): Promise<AnalyticsData>;
  getTopProducts(limit?: number, startDate?: Date, endDate?: Date): Promise<TopProduct[]>;
  getCustomers(options: { page: number; limit: number; search?: string }): Promise<{ customers: CustomerListItem[]; total: number }>;
  getCustomerById(id: string): Promise<CustomerDetail>;
  getOrders(options: { page: number; limit: number; status?: OrderStatus; search?: string; startDate?: Date; endDate?: Date }): Promise<{ orders: OrderListItem[]; total: number }>;
  getOrderById(id: string): Promise<unknown>;
  updateOrderStatus(id: string, data: UpdateOrderStatusInput, adminId: string): Promise<unknown>;
  addTrackingToOrder(id: string, data: AddTrackingInput): Promise<unknown>;
  getRefunds(options: { page: number; limit: number; status?: RefundStatus }): Promise<{ refunds: RefundListItem[]; total: number }>;
  processRefund(id: string, data: ProcessRefundInput): Promise<unknown>;
}
