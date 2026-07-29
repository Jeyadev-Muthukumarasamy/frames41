/**
 * Abandoned cart trigger service implementation
 */

import type { IAbandonedCartTriggerService, IAbandonedCartTriggerRepository } from './abandoned-cart.types.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { CouponType } from '@prisma/client';
import type { JobDispatcher } from '../../infrastructure/queue/job.dispatcher.js';

export class AbandonedCartTriggerService implements IAbandonedCartTriggerService {
  private readonly repository: IAbandonedCartTriggerRepository;
  private readonly jobDispatcher?: JobDispatcher;

  constructor(repository: IAbandonedCartTriggerRepository, jobDispatcher?: JobDispatcher) {
    this.repository = repository;
    this.jobDispatcher = jobDispatcher;
  }

  async trackProductView(userId: string, productId: string): Promise<void> {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product || !product.isActive) {
      throw new NotFoundError('Product');
    }

    await this.repository.trackView(userId, productId);

    logger.debug({ userId, productId }, 'Product view tracked');
  }

  async trackProductExit(userId: string, productId: string): Promise<void> {
    await this.repository.trackExit(userId, productId);

    logger.debug({ userId, productId }, 'Product exit tracked');
  }

  async processAbandonedCarts(): Promise<{ processed: number; couponsSent: number }> {
    // Find triggers that have been exited for at least 60 minutes and haven't received a coupon
    const pendingTriggers = await this.repository.findPendingForCoupon(60);

    let couponsSent = 0;

    for (const trigger of pendingTriggers) {
      try {
        // Check if user has already placed an order for this product since exit
        const hasOrderedSince = await this.hasUserOrderedSince(trigger.userId, trigger.productId, trigger.exitedAt!);
        
        if (hasOrderedSince) {
          // Mark as converted and skip
          await this.repository.markConverted(trigger.userId, trigger.productId);
          logger.info({ userId: trigger.userId, productId: trigger.productId }, 'User ordered since exit, marking converted');
          continue;
        }

        // Check if user has received a coupon recently (last 7 days)
        const hasRecentCoupon = await this.hasRecentCoupon(trigger.userId, 7);
        if (hasRecentCoupon) {
          logger.info({ userId: trigger.userId }, 'User has recent coupon, skipping abandoned cart');
          continue;
        }

        // Create first-order coupon
        const coupon = await this.createFirstOrderCoupon(trigger.userId);

        // Mark trigger as coupon sent
        await this.repository.markCouponSent(trigger.id, coupon.id);

        // Dispatch WhatsApp/SMS job to send coupon
        if (this.jobDispatcher) {
          await this.jobDispatcher.dispatch('send-abandoned-cart-coupon', {
            userId: trigger.userId,
            userPhone: trigger.user.phone,
            userName: trigger.user.name,
            productName: trigger.product.name,
            productSlug: trigger.product.slug,
            couponCode: coupon.code,
            discountValue: coupon.value,
          });
        }

        couponsSent++;
        logger.info({ 
          userId: trigger.userId, 
          productId: trigger.productId,
          couponId: coupon.id,
          couponCode: coupon.code,
        }, 'Abandoned cart coupon sent');
      } catch (error) {
        logger.error({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: trigger.userId,
          productId: trigger.productId,
        }, 'Failed to process abandoned cart trigger');
      }
    }

    return {
      processed: pendingTriggers.length,
      couponsSent,
    };
  }

  private async hasUserOrderedSince(userId: string, productId: string, since: Date): Promise<boolean> {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          placedAt: {
            gte: since,
          },
        },
      },
    });

    return !!orderItem;
  }

  private async hasRecentCoupon(userId: string, days: number): Promise<boolean> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const recentCoupon = await prisma.couponRedemption.findFirst({
      where: {
        userId,
        redeemedAt: {
          gte: cutoffDate,
        },
      },
    });

    // Also check abandoned cart triggers with sent coupons
    const recentTrigger = await prisma.abandonedCartTrigger.findFirst({
      where: {
        userId,
        couponSent: true,
        couponSentAt: {
          gte: cutoffDate,
        },
      },
    });

    return !!recentCoupon || !!recentTrigger;
  }

  private async createFirstOrderCoupon(userId: string): Promise<{ id: string; code: string; value: number }> {
    // Generate unique coupon code
    const code = `COMEBACK${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const now = new Date();
    const validTo = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type: CouponType.FIRST_ORDER,
        value: 10.0, // 10% off
        minOrderValue: 299.0,
        maxDiscount: 100.0,
        perUserLimit: 1,
        validFrom: now,
        validTo,
        isActive: true,
      },
    });

    return {
      id: coupon.id,
      code: coupon.code,
      value: Number(coupon.value),
    };
  }
}
