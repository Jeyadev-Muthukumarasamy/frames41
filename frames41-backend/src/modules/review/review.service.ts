/**
 * Review service implementation
 */

import type {
  IReviewService,
  IReviewRepository,
  ReviewData,
  ReviewSummary,
  CreateReviewInput,
  UpdateReviewInput,
  ReviewWithUser,
} from './review.types.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { OrderStatus } from '@prisma/client';

export class ReviewService implements IReviewService {
  private readonly repository: IReviewRepository;

  constructor(repository: IReviewRepository) {
    this.repository = repository;
  }

  async getProductReviews(
    productId: string,
    options?: { approvedOnly?: boolean; page?: number; limit?: number },
  ): Promise<{ reviews: ReviewData[]; total: number; summary: ReviewSummary }> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const approvedOnly = options?.approvedOnly ?? true;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.repository.findByProductId(productId, {
        approvedOnly,
        limit,
        offset: skip,
      }),
      this.repository.countByProductId(productId, approvedOnly),
    ]);

    const summary = await this.getReviewSummary(productId);

    return {
      reviews: reviews.map((r) => this.mapToReviewData(r)),
      total,
      summary,
    };
  }

  async getUserReviews(userId: string, options?: { page?: number; limit?: number }): Promise<{ reviews: ReviewData[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.repository.findByUserId(userId, { limit, offset: skip }),
      prisma.review.count({ where: { userId } }),
    ]);

    return {
      reviews: reviews.map((r) => this.mapToReviewData(r)),
      total,
    };
  }

  async createReview(userId: string, data: CreateReviewInput): Promise<ReviewData> {
    // Check for duplicate review first so 400 takes precedence over 403
    const existingReview = await this.repository.findByUserAndProduct(userId, data.productId);
    if (existingReview) {
      throw new BadRequestError('You have already reviewed this product');
    }

    // Check if user can review this product
    const { canReview, reason } = await this.canReviewProduct(userId, data.productId, data.orderId);
    if (!canReview) {
      throw new ForbiddenError(reason || 'Cannot review this product');
    }

    // Verify the user has delivered order containing this product if orderId is provided
    let isVerified = false;
    if (data.orderId) {
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          orderId: data.orderId,
          productId: data.productId,
          order: {
            userId,
            status: OrderStatus.DELIVERED,
          },
        },
      });
      isVerified = !!orderItem;

      // Check if already reviewed this order item
      if (orderItem) {
        const alreadyReviewed = await this.repository.hasUserReviewedOrderItem(userId, data.orderId, data.productId);
        if (alreadyReviewed) {
          throw new BadRequestError('You have already reviewed this order item');
        }
      }
    }

    // If not verified through order, check if they've ordered the product before
    if (!isVerified) {
      isVerified = await this.repository.hasUserOrderedProduct(userId, data.productId);
    }

    // Auto-approve verified reviews, require moderation for unverified
    const isApproved = isVerified;

    const review = await this.repository.create({
      ...data,
      userId,
      isVerified,
      isApproved,
    });

    // Get the full review with user info
    const reviewWithUser = await this.repository.findById(review.id);
    if (!reviewWithUser) {
      throw new NotFoundError('Review');
    }

    logger.info({ userId, productId: data.productId, reviewId: review.id }, 'Review created');

    return this.mapToReviewData(reviewWithUser);
  }

  async updateReview(userId: string, reviewId: string, data: UpdateReviewInput): Promise<ReviewData> {
    const review = await this.repository.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review');
    }

    if (review.userId !== userId) {
      throw new ForbiddenError('You can only update your own reviews');
    }

    const updatedReview = await this.repository.update(reviewId, data);

    // Get the full review with user info
    const reviewWithUser = await this.repository.findById(updatedReview.id);
    if (!reviewWithUser) {
      throw new NotFoundError('Review');
    }

    logger.info({ userId, reviewId }, 'Review updated');

    return this.mapToReviewData(reviewWithUser);
  }

  async deleteReview(userId: string, reviewId: string): Promise<void> {
    const review = await this.repository.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review');
    }

    if (review.userId !== userId) {
      throw new ForbiddenError('You can only delete your own reviews');
    }

    await this.repository.delete(reviewId);

    logger.info({ userId, reviewId }, 'Review deleted');
  }

  async markHelpful(reviewId: string): Promise<void> {
    const review = await this.repository.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review');
    }

    await this.repository.incrementHelpfulCount(reviewId);

    logger.info({ reviewId }, 'Review marked as helpful');
  }

  async getReviewSummary(productId: string): Promise<ReviewSummary> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    const [totalReviews, distribution] = await Promise.all([
      this.repository.countByProductId(productId, true),
      this.repository.getRatingDistribution(productId),
    ]);

    // Calculate average
    let totalRating = 0;
    let count = 0;
    distribution.forEach((value, rating) => {
      totalRating += rating * value;
      count += value;
    });

    const averageRating = count > 0 ? Number((totalRating / count).toFixed(1)) : 0;

    return {
      productId,
      averageRating,
      totalReviews,
      ratingDistribution: {
        5: distribution.get(5) || 0,
        4: distribution.get(4) || 0,
        3: distribution.get(3) || 0,
        2: distribution.get(2) || 0,
        1: distribution.get(1) || 0,
      },
    };
  }

  async canReviewProduct(userId: string, productId: string, orderId?: string): Promise<{ canReview: boolean; reason?: string }> {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product) {
      return { canReview: false, reason: 'Product not found' };
    }

    if (!product.isActive) {
      return { canReview: false, reason: 'Product is not available' };
    }

    // Check if already reviewed
    const existingReview = await this.repository.findByUserAndProduct(userId, productId);
    if (existingReview) {
      return { canReview: false, reason: 'You have already reviewed this product' };
    }

    // If orderId provided, verify it
    if (orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
          status: OrderStatus.DELIVERED,
          items: {
            some: {
              productId,
            },
          },
        },
      });

      if (!order) {
        return { canReview: false, reason: 'Order not found or not delivered' };
      }

      return { canReview: true };
    }

    // Otherwise check if user has delivered order containing this product
    const hasOrdered = await this.repository.hasUserOrderedProduct(userId, productId);
    if (!hasOrdered) {
      return { canReview: false, reason: 'You must purchase and receive this product before reviewing' };
    }

    return { canReview: true };
  }

  async getPendingReviews(options: { page: number; limit: number }): Promise<{ reviews: import('./review.types.js').PendingReviewItem[]; total: number }> {
    const offset = (options.page - 1) * options.limit;
    const [rawReviews, total] = await Promise.all([
      this.repository.findPending({ limit: options.limit, offset }),
      this.repository.countPending(),
    ]);

    const reviews = rawReviews.map((r) => {
      const anyR = r as unknown as Record<string, unknown>;
      const product = anyR['product'] as { id: string; name: string } | undefined;
      return {
        id: r.id,
        productId: r.productId,
        productName: product?.name ?? '',
        userId: r.userId,
        userName: r.user.name,
        rating: r.rating,
        title: r.title ?? undefined,
        body: r.body,
        images: (r.images as Array<{ url: string; alt?: string }>) || [],
        isVerified: r.isVerified,
        createdAt: r.createdAt.toISOString(),
      };
    });

    return { reviews, total };
  }

  async approveReview(id: string): Promise<void> {
    const review = await this.repository.findById(id);
    if (!review) throw new NotFoundError('Review');
    await this.repository.approve(id);
    logger.info({ reviewId: id }, 'Review approved by admin');
  }

  async rejectReview(id: string): Promise<void> {
    const review = await this.repository.findById(id);
    if (!review) throw new NotFoundError('Review');
    await this.repository.delete(id);
    logger.info({ reviewId: id }, 'Review rejected by admin');
  }

  private mapToReviewData(review: ReviewWithUser): ReviewData {
    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.user.name || 'Anonymous',
      orderId: review.orderId ?? undefined,
      rating: review.rating,
      title: review.title ?? undefined,
      body: review.body,
      images: (review.images as Array<{ url: string; alt?: string }>) || [],
      isVerified: review.isVerified,
      isApproved: review.isApproved,
      helpfulCount: review.helpfulCount,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }
}
