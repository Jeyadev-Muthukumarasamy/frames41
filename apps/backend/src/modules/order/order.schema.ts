import { z } from 'zod';

/**
 * Order status enum
 */
export const orderStatusSchema = z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']);

/**
 * Address snapshot schema
 */
const addressSnapshotSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
});

/**
 * Create order schema
 */
export const createOrderSchema = z.object({
  addressId: z.string().uuid('Invalid address ID'),
  couponCode: z.string().trim().min(1).max(20).optional(),
});

/**
 * Update order status schema (Admin)
 */
export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  note: z.string().optional(),
});

/**
 * Order ID param schema
 */
export const orderIdParamSchema = z.object({
  id: z.string().uuid('Invalid order ID'),
});

/**
 * Order number param schema
 */
export const orderNumberParamSchema = z.object({
  orderNumber: z.string().min(1),
});

/**
 * Order query schema
 */
export const orderQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  cursor: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
});

/**
 * Refund request schema
 */
export const refundRequestSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  videoUrl: z.string().url().optional(),
});

/**
 * Type exports
 */
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderIdParam = z.infer<typeof orderIdParamSchema>;
export type OrderNumberParam = z.infer<typeof orderNumberParamSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
export type RefundRequestInput = z.infer<typeof refundRequestSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
