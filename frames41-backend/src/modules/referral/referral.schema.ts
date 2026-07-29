/**
 * Referral Zod schemas
 */

import { z } from 'zod';

// Create referral code
export const createReferralCodeSchema = z.object({
  body: z.object({
    code: z.string().min(3, 'Code must be at least 3 characters').max(20, 'Code must be less than 20 characters').regex(/^[A-Z0-9]+$/, 'Code must be alphanumeric uppercase'),
    ownerName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    ownerPhone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional(),
    ownerEmail: z.string().email('Invalid email').optional(),
    discountPercent: z.number().min(1, 'Discount must be at least 1%').max(50, 'Discount must be at most 50%'),
    commissionPercent: z.number().min(1, 'Commission must be at least 1%').max(20, 'Commission must be at most 20%'),
    usageLimit: z.number().int().positive().optional(),
  }),
});

// Update referral code
export const updateReferralCodeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid referral code ID'),
  }),
  body: z.object({
    ownerName: z.string().min(2).max(100).optional(),
    ownerPhone: z.string().regex(/^[0-9]{10}$/).optional(),
    ownerEmail: z.string().email().optional(),
    discountPercent: z.number().min(1).max(50).optional(),
    commissionPercent: z.number().min(1).max(20).optional(),
    usageLimit: z.number().int().positive().optional(),
  }),
});

// Referral code params
export const referralCodeParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid referral code ID'),
  }),
});

// Get by code
export const getByCodeSchema = z.object({
  params: z.object({
    code: z.string().min(3).max(20),
  }),
});

// Validate referral code
export const validateReferralSchema = z.object({
  query: z.object({
    code: z.string().min(3).max(20),
  }),
});

// Apply referral code
export const applyReferralSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(20),
    orderId: z.string().uuid('Invalid order ID'),
    orderTotal: z.number().positive('Order total must be positive'),
  }),
});

// Referral code response
export const referralCodeResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  ownerName: z.string(),
  ownerPhone: z.string().optional(),
  ownerEmail: z.string().optional(),
  discountPercent: z.number(),
  commissionPercent: z.number(),
  usageCount: z.number(),
  usageLimit: z.number().optional(),
  totalDiscountGiven: z.number(),
  totalCommission: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

// Referral redemption response
export const referralRedemptionResponseSchema = z.object({
  id: z.string(),
  referralCode: z.string(),
  referrerName: z.string(),
  discountPercent: z.number(),
  discountAmount: z.number(),
  commissionAmount: z.number(),
  redeemedAt: z.string(),
});

// Validation result
export const validateReferralResultSchema = z.object({
  valid: z.boolean(),
  code: z.string().optional(),
  discountPercent: z.number().optional(),
  message: z.string().optional(),
});

export type CreateReferralCodeInput = z.infer<typeof createReferralCodeSchema>['body'];
export type UpdateReferralCodeInput = z.infer<typeof updateReferralCodeSchema>['body'];
export type ReferralCodeParamsInput = z.infer<typeof referralCodeParamsSchema>['params'];
export type GetByCodeInput = z.infer<typeof getByCodeSchema>['params'];
export type ValidateReferralInput = z.infer<typeof validateReferralSchema>['query'];
export type ApplyReferralInput = z.infer<typeof applyReferralSchema>['body'];
