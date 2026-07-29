/**
 * Job dispatcher - creates jobs in the database for async processing
 */

import type { Prisma, PrismaClient } from '@prisma/client';
import { logger } from '../logger/pino.logger.js';

export type JobType =
  | 'send-email'
  | 'send-whatsapp'
  | 'shiprocket-sync'
  | 'coupon-trigger'
  | 'process-refund'
  | 'expire-gift-cards'
  | 'cleanup-abandoned-cart'
  | 'send-abandoned-cart-coupon';

export interface JobPayload {
  [key: string]: unknown;
}

export class JobDispatcher {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Dispatch a job to the queue
   */
  async dispatch(
    type: JobType,
    payload: JobPayload,
    options?: {
      delayMs?: number;
      maxAttempts?: number;
    },
  ): Promise<string> {
    const runAt = options?.delayMs
      ? new Date(Date.now() + options.delayMs)
      : new Date();

    const job = await this.prisma.job.create({
      data: {
        type,
        payload: payload as Prisma.InputJsonObject,
        status: 'PENDING',
        attempts: 0,
        maxAttempts: options?.maxAttempts ?? 3,
        runAt,
      },
    });

    logger.info({ jobId: job.id, type }, 'Job dispatched');

    return job.id;
  }

  /**
   * Dispatch multiple jobs at once
   */
  async dispatchMany(
    jobs: Array<{ type: JobType; payload: JobPayload; options?: { delayMs?: number; maxAttempts?: number } }>,
  ): Promise<string[]> {
    const created = await this.prisma.$transaction(
      jobs.map((j) =>
        this.prisma.job.create({
          data: {
            type: j.type,
            payload: j.payload as Prisma.InputJsonObject,
            status: 'PENDING',
            attempts: 0,
            maxAttempts: j.options?.maxAttempts ?? 3,
            runAt: j.options?.delayMs ? new Date(Date.now() + j.options.delayMs) : new Date(),
          },
        }),
      ),
    );

    logger.info({ count: created.length }, 'Multiple jobs dispatched');

    return created.map((j) => j.id);
  }
}
