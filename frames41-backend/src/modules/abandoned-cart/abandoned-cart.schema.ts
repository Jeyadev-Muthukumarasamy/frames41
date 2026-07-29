/**
 * Abandoned cart trigger Zod schemas
 */

import { z } from 'zod';

// Track product view
export const trackViewSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

// Track product exit
export const trackExitSchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

// Abandoned cart data response
export const abandonedCartResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  productName: z.string(),
  lastViewedAt: z.string(),
  exitedAt: z.string().optional(),
  couponSent: z.boolean(),
  couponCode: z.string().optional(),
  couponSentAt: z.string().optional(),
});

export type TrackViewInput = z.infer<typeof trackViewSchema>['params'];
export type TrackExitInput = z.infer<typeof trackExitSchema>['params'];
