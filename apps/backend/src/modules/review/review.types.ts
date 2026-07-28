/**
 * Review types
 */

import type { Review, User } from '@prisma/client';

export interface ReviewWithUser extends Review {
  user: Pick<User, 'id' | 'name'>;
}

export interface ReviewImage {
  url: string;
  alt?: string;
}

export interface ReviewData {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  orderId?: string;
  rating: number;
  title?: string;
  body: string;
  images: ReviewImage[];
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewInput {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  body: string;
  images?: ReviewImage[];
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  body?: string;
  images?: ReviewImage[];
}

export interface PendingReviewItem {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string | null;
  rating: number;
  title?: string;
  body: string;
  images: ReviewImage[];
  isVerified: boolean;
  createdAt: string;
}

export interface IReviewRepository {
  findById(id: string): Promise<ReviewWithUser | null>;
  findByProductId(productId: string, options?: { approvedOnly?: boolean; limit?: number; offset?: number }): Promise<ReviewWithUser[]>;
  findByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<ReviewWithUser[]>;
  findByUserAndProduct(userId: string, productId: string): Promise<Review | null>;
  findByUserAndOrder(userId: string, orderId: string): Promise<Review | null>;
  countByProductId(productId: string, approvedOnly?: boolean): Promise<number>;
  getRatingDistribution(productId: string): Promise<Map<number, number>>;
  create(data: CreateReviewInput & { userId: string; isVerified: boolean; isApproved: boolean }): Promise<Review>;
  update(id: string, data: UpdateReviewInput): Promise<Review>;
  delete(id: string): Promise<void>;
  approve(id: string): Promise<Review>;
  incrementHelpfulCount(id: string): Promise<void>;
  hasUserOrderedProduct(userId: string, productId: string): Promise<boolean>;
  hasUserReviewedOrderItem(userId: string, orderId: string, productId: string): Promise<boolean>;
  findPending(options: { limit: number; offset: number }): Promise<ReviewWithUser[]>;
  countPending(): Promise<number>;
}

export interface IReviewService {
  getProductReviews(productId: string, options?: { approvedOnly?: boolean; page?: number; limit?: number }): Promise<{ reviews: ReviewData[]; total: number; summary: ReviewSummary }>;
  getUserReviews(userId: string, options?: { page?: number; limit?: number }): Promise<{ reviews: ReviewData[]; total: number }>;
  createReview(userId: string, data: CreateReviewInput): Promise<ReviewData>;
  updateReview(userId: string, reviewId: string, data: UpdateReviewInput): Promise<ReviewData>;
  deleteReview(userId: string, reviewId: string): Promise<void>;
  markHelpful(reviewId: string): Promise<void>;
  getReviewSummary(productId: string): Promise<ReviewSummary>;
  canReviewProduct(userId: string, productId: string, orderId?: string): Promise<{ canReview: boolean; reason?: string }>;
  getPendingReviews(options: { page: number; limit: number }): Promise<{ reviews: PendingReviewItem[]; total: number }>;
  approveReview(id: string): Promise<void>;
  rejectReview(id: string): Promise<void>;
}
