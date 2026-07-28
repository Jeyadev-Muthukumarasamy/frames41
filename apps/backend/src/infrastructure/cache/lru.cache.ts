import { LRUCache } from 'lru-cache';
import { LRU_CACHE_CONFIG } from '../../config/constants.js';
import { logger } from '../logger/pino.logger.js';

/**
 * LRU Cache factory for different use cases
 * Using in-memory cache instead of Redis for cost constraints
 */
export function createLRUCache<K extends {}, V extends {}>(
  options?: LRUCache.Options<K, V, unknown>,
): LRUCache<K, V> {
  const cache = new LRUCache<K, V>({
    max: options?.max ?? LRU_CACHE_CONFIG.MAX_SIZE,
    ttl: options?.ttl ?? LRU_CACHE_CONFIG.TTL,
    updateAgeOnGet: true,
    updateAgeOnHas: true,
    allowStale: false,
    ...options,
  });

  logger.debug({
    max: cache.max,
    ttl: cache.ttl,
  }, 'LRU cache created');

  return cache;
}

/**
 * Singleton caches for different purposes
 */

// Rate limiting cache
export const rateLimitCache = createLRUCache<string, { count: number; resetAt: number }>({
  max: 10000, // IP addresses
  ttl: 15 * 60 * 1000, // 15 minutes
});

// Email verification rate limiting cache (supplements database)
export const verificationRateLimitCache = createLRUCache<string, { count: number; windowStart: number }>({
  max: 5000,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
});

// User session cache (lightweight, not for tokens)
export const userSessionCache = createLRUCache<string, { role: string; lastActivity: number }>({
  max: 1000,
  ttl: 30 * 60 * 1000, // 30 minutes
});

/**
 * Get cache statistics
 */
export function getCacheStats<K extends {}, V extends {}>(cache: LRUCache<K, V>): {
  size: number;
  max: number;
  hits: number;
  misses: number;
} {
  return {
    size: cache.size,
    max: cache.max,
    hits: 0,
    misses: 0,
  };
}

/**
 * Clear all caches (useful for testing or admin operations)
 */
export function clearAllCaches(): void {
  rateLimitCache.clear();
  verificationRateLimitCache.clear();
  userSessionCache.clear();
  
  logger.info('All caches cleared');
}
