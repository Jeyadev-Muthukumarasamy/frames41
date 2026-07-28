import { z } from 'zod';

/**
 * Create Razorpay order schema
 */
export const createPaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
});

/**
 * Verify payment schema
 */
export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

/**
 * Payment ID param schema
 */
export const paymentIdParamSchema = z.object({
  id: z.string().uuid('Invalid payment ID'),
});

/**
 * Type exports
 */
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type PaymentIdParam = z.infer<typeof paymentIdParamSchema>;
