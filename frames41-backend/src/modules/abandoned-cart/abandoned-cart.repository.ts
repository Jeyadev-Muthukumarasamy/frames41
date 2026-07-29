/**
 * Abandoned cart trigger repository implementation
 */

import type { PrismaClient, AbandonedCartTrigger } from '@prisma/client';
import type { IAbandonedCartTriggerRepository, AbandonedCartTriggerWithRelations } from './abandoned-cart.types.js';

export class AbandonedCartTriggerRepository implements IAbandonedCartTriggerRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<AbandonedCartTrigger | null> {
    return this.prisma.abandonedCartTrigger.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async findPendingForCoupon(minutesSinceExit: number): Promise<AbandonedCartTriggerWithRelations[]> {
    const cutoffTime = new Date(Date.now() - minutesSinceExit * 60 * 1000);

    const triggers = await this.prisma.abandonedCartTrigger.findMany({
      where: {
        exitedAt: {
          not: null,
          lte: cutoffTime,
        },
        couponSent: false,
        convertedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        coupon: true,
      },
    });

    return triggers as AbandonedCartTriggerWithRelations[];
  }

  async trackView(userId: string, productId: string): Promise<AbandonedCartTrigger> {
    return this.prisma.abandonedCartTrigger.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        lastViewedAt: new Date(),
        exitedAt: null,
        convertedAt: null,
      },
      create: {
        userId,
        productId,
        lastViewedAt: new Date(),
        couponSent: false,
      },
    });
  }

  async trackExit(userId: string, productId: string): Promise<void> {
    await this.prisma.abandonedCartTrigger.updateMany({
      where: {
        userId,
        productId,
        exitedAt: null,
      },
      data: {
        exitedAt: new Date(),
      },
    });
  }

  async markCouponSent(id: string, couponId: string): Promise<void> {
    await this.prisma.abandonedCartTrigger.update({
      where: { id },
      data: {
        couponSent: true,
        couponId,
        couponSentAt: new Date(),
      },
    });
  }

  async markConverted(userId: string, productId: string): Promise<void> {
    await this.prisma.abandonedCartTrigger.updateMany({
      where: {
        userId,
        productId,
      },
      data: {
        convertedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.abandonedCartTrigger.delete({
      where: { id },
    });
  }

  async cleanupOldTriggers(days: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await this.prisma.abandonedCartTrigger.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
