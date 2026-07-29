/**
 * Wishlist Zod schemas
 */

import { z } from 'zod';

// Add to wishlist
export const addToWishlistSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

// Remove from wishlist
export const removeFromWishlistSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

// Toggle wishlist item
export const toggleWishlistSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

// Check wishlist status
export const checkWishlistSchema = z.object({
  query: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

// Wishlist item response
export const wishlistItemResponseSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  productSlug: z.string(),
  productImage: z.string().optional(),
  categoryName: z.string(),
  basePrice: z.number(),
  discountedPrice: z.number().optional(),
  stock: z.number(),
  isActive: z.boolean(),
  addedAt: z.string(),
});

// Wishlist response
export const wishlistResponseSchema = z.object({
  userId: z.string(),
  items: z.array(wishlistItemResponseSchema),
  itemCount: z.number(),
});

// Toggle response
export const toggleWishlistResponseSchema = z.object({
  added: z.boolean(),
  wishlist: wishlistResponseSchema,
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>['body'];
export type RemoveFromWishlistInput = z.infer<typeof removeFromWishlistSchema>['params'];
export type ToggleWishlistInput = z.infer<typeof toggleWishlistSchema>['body'];
export type CheckWishlistInput = z.infer<typeof checkWishlistSchema>['query'];
