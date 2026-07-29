/**
 * Cron scheduler - dispatches recurring background jobs
 * Runs in the main process, can also run standalone
 */

import cron from 'node-cron';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { logger } from '../infrastructure/logger/pino.logger.js';
import { JobDispatcher } from '../infrastructure/queue/job.dispatcher.js';

/**
 * Initialize cron jobs
 * Call this after server starts
 */
export function initializeScheduler(): void {
  const dispatcher = new JobDispatcher(prisma);

  // Abandoned cart processing - every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await dispatcher.dispatch('coupon-trigger', {});
      logger.debug('Scheduled abandoned cart job');
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown' }, 'Failed to schedule abandoned cart job');
    }
  });

  // Expired gift card cleanup - daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      await dispatcher.dispatch('expire-gift-cards', {});
      logger.debug('Scheduled gift card cleanup job');
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown' }, 'Failed to schedule gift card cleanup');
    }
  });

  // Stale job lock cleanup - every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      const staleThreshold = new Date(Date.now() - 10 * 60 * 1000);
      const result = await prisma.job.updateMany({
        where: {
          status: 'RUNNING',
          lockedAt: { lt: staleThreshold },
        },
        data: {
          status: 'PENDING',
          lockedAt: null,
          lockedBy: null,
        },
      });

      if (result.count > 0) {
        logger.info({ count: result.count }, 'Scheduler cleaned up stale locks');
      }
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown' }, 'Failed to cleanup stale locks');
    }
  });

  logger.info('Cron scheduler initialized');
}
