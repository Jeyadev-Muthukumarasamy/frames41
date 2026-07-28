/**
 * Abandoned cart coupon job
 * Sends coupons to users who abandoned their cart
 */

import { prisma } from '../../database/prisma.client.js';
import { logger } from '../../logger/pino.logger.js';
import { AbandonedCartTriggerRepository } from '../../../modules/abandoned-cart/abandoned-cart.repository.js';
import { AbandonedCartTriggerService } from '../../../modules/abandoned-cart/abandoned-cart.service.js';

/**
 * Process abandoned carts and send coupons
 * This job runs every 5 minutes via node-cron
 */
export async function processAbandonedCartsJob(): Promise<void> {
  logger.info('Starting abandoned cart processing job');

  try {
    const repository = new AbandonedCartTriggerRepository(prisma);
    const service = new AbandonedCartTriggerService(repository);

    const result = await service.processAbandonedCarts();

    logger.info({
      processed: result.processed,
      couponsSent: result.couponsSent,
    }, 'Abandoned cart processing completed');
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, 'Abandoned cart processing failed');
    throw error;
  }
}

/**
 * Cleanup old abandoned cart triggers
 * Removes triggers older than 30 days
 */
export async function cleanupAbandonedCartsJob(): Promise<void> {
  logger.info('Starting abandoned cart cleanup job');

  try {
    const repository = new AbandonedCartTriggerRepository(prisma);
    const deletedCount = await repository.cleanupOldTriggers(30);

    logger.info({ deletedCount }, 'Abandoned cart cleanup completed');
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'Abandoned cart cleanup failed');
    throw error;
  }
}

/**
 * Cleanup expired gift cards
 * Deactivates gift cards past their expiration date
 */
export async function cleanupExpiredGiftCardsJob(): Promise<void> {
  logger.info('Starting expired gift cards cleanup job');

  try {
    const { GiftCardRepository } = await import('../../../modules/giftcard/giftcard.repository.js');
    const repository = new GiftCardRepository(prisma);
    
    const deactivatedCount = await repository.cleanupExpired();

    if (deactivatedCount > 0) {
      logger.info({ deactivatedCount }, 'Expired gift cards deactivated');
    }
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'Expired gift cards cleanup failed');
    throw error;
  }
}
