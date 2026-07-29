/**
 * Gift card Zod schemas
 */

import { z } from 'zod';

// Create gift card
export const createGiftCardSchema = z.object({
  body: z.object({
    balance: z.number().positive('Balance must be positive').min(50, 'Minimum balance is ₹50').max(10000, 'Maximum balance is ₹10,000'),
    recipientPhone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional(),
    recipientEmail: z.string().email('Invalid email').optional(),
    recipientName: z.string().min(1).max(100).optional(),
    message: z.string().max(500, 'Message must be less than 500 characters').optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

// Gift card code params
export const giftCardCodeSchema = z.object({
  params: z.object({
    code: z.string().min(8).max(30),
  }),
});

// Validate gift card
export const validateGiftCardSchema = z.object({
  query: z.object({
    code: z.string().min(8).max(30),
  }),
});

// Redeem gift card
export const redeemGiftCardSchema = z.object({
  body: z.object({
    code: z.string().min(8).max(30),
  }),
});

// Apply gift card to order
export const applyGiftCardSchema = z.object({
  body: z.object({
    giftCardId: z.string().uuid('Invalid gift card ID'),
    orderId: z.string().uuid('Invalid order ID'),
    amount: z.number().positive('Amount must be positive'),
  }),
});

// Gift card response
export const giftCardResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  balance: z.number(),
  initialBalance: z.number(),
  recipientPhone: z.string().optional(),
  recipientEmail: z.string().optional(),
  recipientName: z.string().optional(),
  message: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
  isRedeemed: z.boolean(),
  redeemedAt: z.string().optional(),
  purchasedAt: z.string(),
});

// Gift card transaction response
export const giftCardTransactionSchema = z.object({
  id: z.string(),
  type: z.string(),
  amount: z.number(),
  description: z.string().optional(),
  orderId: z.string().optional(),
  createdAt: z.string(),
});

// Gift card balance response
export const giftCardBalanceResponseSchema = giftCardResponseSchema.extend({
  transactions: z.array(giftCardTransactionSchema),
});

// Validate result
export const validateGiftCardResultSchema = z.object({
  valid: z.boolean(),
  giftCardId: z.string().optional(),
  balance: z.number().optional(),
  message: z.string().optional(),
});

export type CreateGiftCardInput = z.infer<typeof createGiftCardSchema>['body'];
export type GiftCardCodeInput = z.infer<typeof giftCardCodeSchema>['params'];
export type ValidateGiftCardInput = z.infer<typeof validateGiftCardSchema>['query'];
export type RedeemGiftCardInput = z.infer<typeof redeemGiftCardSchema>['body'];
export type ApplyGiftCardInput = z.infer<typeof applyGiftCardSchema>['body'];
