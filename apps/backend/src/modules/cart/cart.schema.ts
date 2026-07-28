import { z } from 'zod';

/**
 * Decimal validation (price)
 */
const decimalSchema = z.union([
  z.number().min(0),
  z.string().regex(/^\d+(\.\d{1,2})?$/),
]).transform((val) => (typeof val === 'string' ? parseFloat(val) : val));

/**
 * Add item to cart schema
 */
export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  customization: z.record(z.unknown()).optional(),
  customImageUrl: z.string().url().optional(),
});

/**
 * Update cart item schema
 */
export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be 0 or more'),
  customization: z.record(z.unknown()).optional(),
});

/**
 * Cart item ID param schema
 */
export const cartItemIdParamSchema = z.object({
  id: z.string().uuid('Invalid cart item ID'),
});

/**
 * Calculate cart schema
 */
export const calculateCartSchema = z.object({
  couponCode: z.string().trim().min(1).max(20).optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional(),
});

/**
 * Cart response schema
 */
export const cartResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(z.object({
    id: z.string(),
    productId: z.string(),
    productName: z.string(),
    productSlug: z.string(),
    productImage: z.string().optional(),
    variantId: z.string().optional(),
    variantName: z.string().optional(),
    quantity: z.number(),
    unitPrice: z.number(),
    totalPrice: z.number(),
    customization: z.record(z.unknown()).optional(),
    customImageUrl: z.string().optional(),
  })),
  subtotal: z.number(),
  itemCount: z.number(),
  updatedAt: z.string(),
});

/**
 * Cart calculation response schema
 */
export const cartCalculationSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    totalPrice: z.number(),
    tierDiscount: z.number().optional(),
  })),
  subtotal: z.number(),
  couponDiscount: z.number(),
  couponCode: z.string().optional(),
  shippingCharge: z.number(),
  shippingFree: z.boolean(),
  total: z.number(),
  itemCount: z.number(),
});

/**
 * Type exports
 */
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartItemIdParam = z.infer<typeof cartItemIdParamSchema>;
export type CalculateCartInput = z.infer<typeof calculateCartSchema>;
export type CartResponse = z.infer<typeof cartResponseSchema>;
export type CartCalculation = z.infer<typeof cartCalculationSchema>;
