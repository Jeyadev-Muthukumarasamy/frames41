import type { NextFunction, Request, Response } from 'express';
import { rateLimitCache } from '../infrastructure/cache/lru.cache.js';
import { RATE_LIMITS } from '../config/constants.js';
import { RateLimitError } from '../shared/errors/AppError.js';
import { env } from '../config/env.js';

/**
 * Get client IP address
 */
function getClientIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
    || req.socket.remoteAddress 
    || 'unknown';
}

/**
 * Create rate limit key
 */
function createRateLimitKey(identifier: string, prefix: string): string {
  return `${prefix}:${identifier}`;
}

/**
 * Generic rate limiter middleware factory
 */
export function createRateLimiter(
  windowMs: number,
  maxRequests: number,
  keyPrefix: string,
  keyGenerator?: (req: Request) => string,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (env.NODE_ENV === 'development') { next(); return; }

    const identifier = keyGenerator ? keyGenerator(req) : getClientIp(req);
    const key = createRateLimitKey(identifier, keyPrefix);
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get current rate limit data
    const current = rateLimitCache.get(key);
    
    if (!current || current.resetAt < now) {
      // First request or window expired
      rateLimitCache.set(key, { count: 1, resetAt: now + windowMs });
      
      // Set headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (maxRequests - 1).toString());
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      
      next();
      return;
    }
    
    if (current.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      
      next(new RateLimitError(retryAfter));
      return;
    }
    
    // Increment counter
    current.count += 1;
    rateLimitCache.set(key, current);
    
    // Set headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - current.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(current.resetAt).toISOString());
    
    next();
  };
}

/**
 * Auth endpoint rate limiter (stricter)
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = createRateLimiter(
  RATE_LIMITS.AUTH.WINDOW_MS,
  RATE_LIMITS.AUTH.MAX_REQUESTS,
  'auth',
  getClientIp,
);

/**
 * Search endpoint rate limiter
 * 30 requests per minute per IP
 */
export const searchRateLimiter = createRateLimiter(
  RATE_LIMITS.SEARCH.WINDOW_MS,
  RATE_LIMITS.SEARCH.MAX_REQUESTS,
  'search',
  getClientIp,
);

/**
 * Order endpoint rate limiter
 * 3 requests per minute per user (or IP if not authenticated)
 */
export const orderRateLimiter = createRateLimiter(
  RATE_LIMITS.ORDER.WINDOW_MS,
  RATE_LIMITS.ORDER.MAX_REQUESTS,
  'order',
  (req) => req.user?.userId || getClientIp(req),
);

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = createRateLimiter(
  RATE_LIMITS.DEFAULT.WINDOW_MS,
  RATE_LIMITS.DEFAULT.MAX_REQUESTS,
  'api',
  getClientIp,
);
