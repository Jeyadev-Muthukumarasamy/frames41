import { z } from 'zod';

/**
 * Coupon type enum
 */
export const couponTypeSchema = z.enum(['PERCENT', 'FLAT', 'FIRST_ORDER']);

/**
 * Create coupon schema
 */
export const createCouponSchema = z.object({
  code: z.string().trim().min(3).max(20).regex(/^[A-Za-z0-9_-]+$/).toUpperCase(),
  type: couponTypeSchema,
  value: z.number().positive(),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  perUserLimit: z.number().int().min(1).optional(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  isActive: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.type === 'PERCENT' && data.value > 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value'], message: 'Percentage cannot exceed 100' });
  }
  if (new Date(data.validTo) <= new Date(data.validFrom)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['validTo'], message: 'End date must be after start date' });
  }
});

/**
 * Update coupon schema
 */
export const updateCouponSchema = z.object({
  code: z.string().trim().min(3).max(20).regex(/^[A-Za-z0-9_-]+$/).toUpperCase().optional(),
  type: couponTypeSchema.optional(),
  value: z.number().positive().optional(),
  minOrderValue: z.number().min(0).nullable().optional(),
  maxDiscount: z.number().min(0).nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  perUserLimit: z.number().int().min(1).nullable().optional(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const couponIdParamSchema = z.object({
  id: z.string().uuid('Invalid coupon ID'),
});

/**
 * Validate coupon schema
 */
export const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderValue: z.number().min(0).optional(),
});

/**
 * Coupon code param schema
 */
export const couponCodeParamSchema = z.object({
  code: z.string().min(1),
});

/**
 * Type exports
 */
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type CouponCodeParam = z.infer<typeof couponCodeParamSchema>;
export type CouponType = z.infer<typeof couponTypeSchema>;
