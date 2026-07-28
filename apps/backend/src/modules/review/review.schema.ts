/**
 * Review Zod schemas
 */

import { z } from 'zod';

// Review image schema
export const reviewImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().max(100, 'Alt text too long').optional(),
});

// Create review
export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    orderId: z.string().uuid('Invalid order ID').optional(),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    title: z.string().max(100, 'Title must be less than 100 characters').optional(),
    body: z.string().min(10, 'Review must be at least 10 characters').max(2000, 'Review must be less than 2000 characters'),
    images: z.array(reviewImageSchema).max(3, 'Maximum 3 images allowed').optional(),
  }),
});

// Update review
export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().max(100).optional(),
    body: z.string().min(10).max(2000).optional(),
    images: z.array(reviewImageSchema).max(3).optional(),
  }),
});

// Review params
export const reviewParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
});

// Product reviews query
export const productReviewsQuerySchema = z.object({
  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10'),
    approvedOnly: z.enum(['true', 'false']).default('true'),
  }),
});

// User reviews query
export const userReviewsQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10'),
  }),
});

// Can review check
export const canReviewSchema = z.object({
  query: z.object({
    productId: z.string().uuid('Invalid product ID'),
    orderId: z.string().uuid('Invalid order ID').optional(),
  }),
});

// Review response
export const reviewResponseSchema = z.object({
  id: z.string(),
  productId: z.string(),
  userId: z.string(),
  userName: z.string(),
  orderId: z.string().optional(),
  rating: z.number(),
  title: z.string().optional(),
  body: z.string(),
  images: z.array(reviewImageSchema),
  isVerified: z.boolean(),
  isApproved: z.boolean(),
  helpfulCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Review summary response
export const reviewSummarySchema = z.object({
  productId: z.string(),
  averageRating: z.number(),
  totalReviews: z.number(),
  ratingDistribution: z.object({
    5: z.number(),
    4: z.number(),
    3: z.number(),
    2: z.number(),
    1: z.number(),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];
export type ReviewParamsInput = z.infer<typeof reviewParamsSchema>['params'];
export type ProductReviewsQueryInput = { params: z.infer<typeof productReviewsQuerySchema>['params']; query: z.infer<typeof productReviewsQuerySchema>['query'] };
export type UserReviewsQueryInput = z.infer<typeof userReviewsQuerySchema>['query'];
export type CanReviewInput = z.infer<typeof canReviewSchema>['query'];
