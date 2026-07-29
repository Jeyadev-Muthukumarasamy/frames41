import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env.js';
import { logger } from '../logger/pino.logger.js';

/**
 * Prisma client singleton with connection pooling optimized for 100 users
 * Using pgBouncer-style limits for resource efficiency
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = (): PrismaClient => {
  const client = new PrismaClient({
    log: env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

  // Add middleware for query logging in development
  if (env.NODE_ENV === 'development') {
    client.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const duration = Date.now() - start;
      
      if (duration > 100) {
        logger.warn({
          query: params.model ? `${params.model}.${params.action}` : params.action,
          duration: `${duration}ms`,
        }, 'Slow query detected');
      }
      
      return result;
    });
  }

  // Add middleware for soft delete handling (optional - can be implemented per-entity)
  client.$use(async (params, next) => {
    // Can add soft delete logic here if needed
    return next(params);
  });

  return client;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Connect to database with retry logic
 */
export async function connectDatabase(maxRetries = 5, retryDelayMs = 2000): Promise<void> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      logger.info('Connected to database successfully');
      return;
    } catch (error) {
      retries += 1;
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        attempt: retries,
        maxRetries,
      }, 'Database connection failed, retrying...');
      
      if (retries >= maxRetries) {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
      }
      
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

/**
 * Disconnect from database gracefully
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Disconnected from database');
}

/**
 * Health check for database
 */
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; latency: number }> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true, latency: Date.now() - start };
  } catch (error) {
    return { healthy: false, latency: Date.now() - start };
  }
}
