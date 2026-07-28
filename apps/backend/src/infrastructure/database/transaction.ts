import { Prisma, PrismaClient } from '@prisma/client';
import { logger } from '../logger/pino.logger.js';

/**
 * Execute a transaction with proper error handling and logging
 * Uses Prisma's interactive transactions for complex operations
 */
export async function executeTransaction<T>(
  prisma: PrismaClient,
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
): Promise<T> {
  const start = Date.now();
  
  try {
    const result = await prisma.$transaction(callback, {
      maxWait: options?.maxWait ?? 5000,
      timeout: options?.timeout ?? 10000,
      isolationLevel: options?.isolationLevel ?? Prisma.TransactionIsolationLevel.Serializable,
    });
    
    logger.debug({
      duration: Date.now() - start,
    }, 'Transaction completed successfully');
    
    return result;
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start,
    }, 'Transaction failed');
    throw error;
  }
}

/**
 * Execute a transaction with FOR UPDATE locking
 * Useful for inventory management, preventing race conditions
 */
export async function executeWithLock<T>(
  prisma: PrismaClient,
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return executeTransaction(prisma, callback, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}


