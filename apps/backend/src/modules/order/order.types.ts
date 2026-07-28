import type { Order, OrderItem, OrderStatusHistory, Payment, RefundRequest } from '@prisma/client';
import type { PaginatedResult, PaginationParams } from '../../shared/types/index.js';

/**
 * Order with relations
 */
export interface OrderWithRelations extends Order {
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  payment?: Payment | null;
  refundRequest?: RefundRequest | null;
}

/**
 * Order item data
 */
export interface OrderItemData {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: Record<string, unknown>;
}

/**
 * Order data for API response
 */
export interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  addressSnapshot: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  couponCode?: string;
  items: OrderItemData[];
  payment?: {
    status: string;
    method?: string;
    razorpayOrderId: string;
  };
  placedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

/**
 * Order repository interface
 */
export interface IOrderRepository {
  /**
   * Create order
   */
  create(data: {
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
  }): Promise<OrderWithRelations>;

  /**
   * Find order by ID
   */
  findById(id: string): Promise<OrderWithRelations | null>;

  /**
   * Find order by order number
   */
  findByOrderNumber(orderNumber: string): Promise<OrderWithRelations | null>;

  /**
   * Find orders by user ID
   */
  findByUserId(userId: string, pagination: PaginationParams): Promise<PaginatedResult<OrderWithRelations>>;

  /**
   * Update order status
   */
  updateStatus(id: string, status: string, note?: string, changedBy?: string): Promise<Order>;

  /**
   * Update order payment
   */
  updatePayment(id: string, paymentId: string): Promise<Order>;

  /**
   * Reserve stock
   */
  reserveStock(productId: string, quantity: number): Promise<void>;

  /**
   * Release stock
   */
  releaseStock(productId: string, quantity: number): Promise<void>;

  /**
   * Deduct stock (after payment)
   */
  deductStock(productId: string, quantity: number): Promise<void>;
}

/**
 * Order service interface
 */
export interface IOrderService {
  /**
   * Create order from cart
   */
  createOrder(userId: string, data: { addressId: string; couponCode?: string }): Promise<OrderData>;

  /**
   * Get order by ID
   */
  getOrderById(orderId: string, userId: string, userRole: string): Promise<OrderData>;

  /**
   * Get order by order number
   */
  getOrderByNumber(orderNumber: string, userId: string, userRole: string): Promise<OrderData>;

  /**
   * Get user orders
   */
  getUserOrders(userId: string, cursor?: string, limit?: number): Promise<PaginatedResult<OrderData>>;

  /**
   * Update order status (Admin)
   */
  updateOrderStatus(
    orderId: string,
    data: { status: string; note?: string },
    adminId: string,
  ): Promise<OrderData>;

  /**
   * Request refund
   */
  requestRefund(userId: string, orderId: string, data: { reason: string; videoUrl?: string }): Promise<void>;

  /**
   * Cancel order
   */
  cancelOrder(userId: string, orderId: string): Promise<void>;
}
