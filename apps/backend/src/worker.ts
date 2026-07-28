/**
 * Worker process for background jobs
 * Polls Job table and processes with exponential backoff
 */

import { logger } from './infrastructure/logger/pino.logger.js';
import { connectDatabase, disconnectDatabase, prisma } from './infrastructure/database/prisma.client.js';
import { setupUncaughtExceptionHandlers } from './middleware/error.middleware.js';
import { JobDispatcher } from './infrastructure/queue/job.dispatcher.js';
import {
  processAbandonedCartsJob,
  cleanupAbandonedCartsJob,
  cleanupExpiredGiftCardsJob,
} from './infrastructure/queue/jobs/abandoned-cart.job.js';

const POLL_INTERVAL_MS = 30000; // 30 seconds
const WORKER_ID = `worker-${process.pid}-${Date.now()}`;

/**
 * Process a single job with idempotency check
 */
async function processJob(jobId: string, type: string, payload: Record<string, unknown>): Promise<void> {
  logger.info({ jobId, type }, 'Processing job');

  switch (type) {
    case 'coupon-trigger':
    case 'cleanup-abandoned-cart': {
      await processAbandonedCartsJob();
      break;
    }
    case 'expire-gift-cards': {
      await cleanupExpiredGiftCardsJob();
      break;
    }
    case 'shiprocket-sync': {
      // Import dynamically to avoid circular deps
      const { shiprocketSyncJob } = await import('./infrastructure/queue/jobs/shiprocket-sync.job.js');
      await shiprocketSyncJob(payload);
      break;
    }
    case 'send-email': {
      const { sendEmailJob } = await import('./infrastructure/queue/jobs/send-email.job.js');
      await sendEmailJob(payload);
      break;
    }
    case 'send-whatsapp': {
      const { sendWhatsAppJob } = await import('./infrastructure/queue/jobs/send-whatsapp.job.js');
      await sendWhatsAppJob(payload);
      break;
    }
    case 'process-refund': {
      // Refund processing handled manually via admin for now
      logger.info({ jobId }, 'Refund job queued for manual processing');
      break;
    }
    default: {
      logger.warn({ jobId, type }, 'Unknown job type');
      throw new Error(`Unknown job type: ${type}`);
    }
  }
}

/**
 * Calculate next retry time with exponential backoff + jitter
 */
function calculateRetryTime(attempts: number): Date {
  const baseDelay = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
  const jitter = Math.random() * 1000; // 0-1s jitter
  return new Date(Date.now() + baseDelay + jitter);
}

/**
 * Poll for and process pending jobs
 */
async function pollJobs(): Promise<void> {
  try {
    const now = new Date();

    // Find jobs ready to run
    const jobs = await prisma.job.findMany({
      where: {
        status: 'PENDING',
        runAt: { lte: now },
        attempts: { lt: prisma.job.fields.maxAttempts },
      },
      orderBy: { runAt: 'asc' },
      take: 10, // Process in batches
    });

    if (jobs.length === 0) return;

    logger.debug({ count: jobs.length }, 'Found jobs to process');

    for (const job of jobs) {
      try {
        // Lock the job
        const locked = await prisma.job.updateMany({
          where: {
            id: job.id,
            status: 'PENDING',
            lockedAt: null,
          },
          data: {
            status: 'RUNNING',
            lockedAt: new Date(),
            lockedBy: WORKER_ID,
            attempts: { increment: 1 },
          },
        });

        if (locked.count === 0) {
          logger.debug({ jobId: job.id }, 'Job already locked by another worker');
          continue;
        }

        // Process the job
        await processJob(job.id, job.type, job.payload as Record<string, unknown>);

        // Mark as completed
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: 'COMPLETED',
            lockedAt: null,
            lockedBy: null,
          },
        });

        logger.info({ jobId: job.id, type: job.type }, 'Job completed');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        logger.error({ jobId: job.id, error: errorMessage }, 'Job failed');

        // Check if max attempts reached (dead letter)
        const updatedJob = await prisma.job.update({
          where: { id: job.id },
          data: {
            status: job.attempts + 1 >= job.maxAttempts ? 'FAILED' : 'PENDING',
            error: errorMessage,
            runAt: calculateRetryTime(job.attempts + 1),
            lockedAt: null,
            lockedBy: null,
          },
        });

        if (updatedJob.status === 'FAILED') {
          logger.error({ jobId: job.id, attempts: updatedJob.attempts }, 'Job dead-lettered');
        }
      }
    }
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Job polling failed');
  }
}

/**
 * Cleanup stale locks from crashed workers
 */
async function cleanupStaleLocks(): Promise<void> {
  const staleThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes

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
    logger.info({ count: result.count }, 'Cleaned up stale job locks');
  }
}

/**
 * Start the worker process
 */
async function startWorker(): Promise<void> {
  setupUncaughtExceptionHandlers();

  try {
    await connectDatabase();
    logger.info({ workerId: WORKER_ID }, 'Worker process started');

    // Cleanup stale locks on startup
    await cleanupStaleLocks();

    // Schedule periodic cleanup cron jobs using node-cron via dispatcher
    const dispatcher = new JobDispatcher(prisma);

    // Schedule recurring jobs if not already scheduled
    const existingCronJobs = await prisma.job.findMany({
      where: {
        type: { in: ['coupon-trigger', 'expire-gift-cards'] },
        status: 'PENDING',
        runAt: { gt: new Date() },
      },
    });

    if (existingCronJobs.length === 0) {
      // Schedule abandoned cart processing every 5 minutes
      await dispatcher.dispatch('coupon-trigger', {}, { delayMs: 5 * 60 * 1000 });

      // Schedule gift card cleanup daily
      await dispatcher.dispatch('expire-gift-cards', {}, { delayMs: 24 * 60 * 60 * 1000 });
    }

    // Start polling loop
    const pollInterval = setInterval(pollJobs, POLL_INTERVAL_MS);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Worker shutting down...');

      clearInterval(pollInterval);

      // Release any locks held by this worker
      await prisma.job.updateMany({
        where: { lockedBy: WORKER_ID },
        data: { status: 'PENDING', lockedAt: null, lockedBy: null },
      });

      await disconnectDatabase();
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Initial poll
    await pollJobs();
  } catch (error) {
    logger.fatal({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to start worker');
    process.exit(1);
  }
}

startWorker();
