/**
 * Review repository implementation
 */

import type { Prisma, PrismaClient, Review } from '@prisma/client';
import type { IReviewRepository, ReviewWithUser, CreateReviewInput, UpdateReviewInput } from './review.types.js';
import { OrderStatus } from '@prisma/client';

export class ReviewRepository implements IReviewRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<ReviewWithUser | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return review as ReviewWithUser | null;
  }

  async findByProductId(
    productId: string,
    options?: { approvedOnly?: boolean; limit?: number; offset?: number },
  ): Promise<ReviewWithUser[]> {
    const reviews = await this.prisma.review.findMany({
      where: {
        productId,
        ...(options?.approvedOnly && { isApproved: true }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: options?.offset,
      take: options?.limit,
    });

    return reviews as ReviewWithUser[];
  }

  async findByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<ReviewWithUser[]> {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: options?.offset,
      take: options?.limit,
    });

    return reviews as ReviewWithUser[];
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<Review | null> {
    return this.prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });
  }

  async findByUserAndOrder(userId: string, orderId: string): Promise<Review | null> {
    return this.prisma.review.findFirst({
      where: {
        userId,
        orderId,
      },
    });
  }

  async countByProductId(productId: string, approvedOnly?: boolean): Promise<number> {
    return this.prisma.review.count({
      where: {
        productId,
        ...(approvedOnly && { isApproved: true }),
      },
    });
  }

  async getRatingDistribution(productId: string): Promise<Map<number, number>> {
    const results = await this.prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId,
        isApproved: true,
      },
      _count: {
        rating: true,
      },
    });

    const distribution = new Map<number, number>([
      [5, 0],
      [4, 0],
      [3, 0],
      [2, 0],
      [1, 0],
    ]);

    results.forEach((result) => {
      distribution.set(result.rating, result._count.rating);
    });

    return distribution;
  }

  async create(data: CreateReviewInput & { userId: string; isVerified: boolean; isApproved: boolean }): Promise<Review> {
    return this.prisma.review.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        orderId: data.orderId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        images: data.images as Prisma.InputJsonValue | undefined,
        isVerified: data.isVerified,
        isApproved: data.isApproved,
      },
    });
  }

  async update(id: string, data: UpdateReviewInput): Promise<Review> {
    return this.prisma.review.update({
      where: { id },
      data: {
        ...(data.rating && { rating: data.rating }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.body && { body: data.body }),
        ...(data.images && { images: data.images as unknown as Prisma.InputJsonValue }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({
      where: { id },
    });
  }

  async approve(id: string): Promise<Review> {
    return this.prisma.review.update({
      where: { id },
      data: { isApproved: true },
    });
  }

  async findPending(options: { limit: number; offset: number }): Promise<ReviewWithUser[]> {
    const reviews = await this.prisma.review.findMany({
      where: { isApproved: false },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
      skip: options.offset,
      take: options.limit,
    });
    return reviews as unknown as ReviewWithUser[];
  }

  async countPending(): Promise<number> {
    return this.prisma.review.count({ where: { isApproved: false } });
  }

  async incrementHelpfulCount(id: string): Promise<void> {
    await this.prisma.review.update({
      where: { id },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });
  }

  async hasUserOrderedProduct(userId: string, productId: string): Promise<boolean> {
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: OrderStatus.DELIVERED,
        },
      },
    });

    return !!orderItem;
  }

  async hasUserReviewedOrderItem(userId: string, orderId: string, productId: string): Promise<boolean> {
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        orderId,
        productId,
      },
    });

    return !!existingReview;
  }
}
