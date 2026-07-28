import type { NextFunction, Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { CACHE_TTL } from '../config/constants.js';
import { logger } from '../infrastructure/logger/pino.logger.js';

/**
 * Get idempotency key from headers
 */

//test push
function getIdempotencyKey(req: Request): string | null {
  const key = req.headers['idempotency-key'];
  return typeof key === 'string' && key.length > 0 ? key : null;
}

/**
 * Create hash of request body for comparison
 */
function hashRequestBody(body: unknown): string {
  const str = JSON.stringify(body || {});
  return createHash('sha256').update(str).digest('hex');
}

/**
 * Idempotency middleware
 * Prevents duplicate requests within a 24-hour window
 */
export function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Skip for GET, HEAD, OPTIONS (idempotent by HTTP spec)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const key = getIdempotencyKey(req);
  
  if (!key) {
    // Idempotency key is optional - continue without it
    next();
    return;
  }

  // Process asynchronously
  (async () => {
    try {
      const userId = req.user?.userId;
      const requestHash = hashRequestBody(req.body);
      const compositeKey = `${key}:${userId || 'anon'}:${requestHash}`;
      
      // Check for existing idempotency key
      const existing = await prisma.idempotencyKey.findUnique({
        where: { key: compositeKey },
      });

      if (existing && existing.expiresAt > new Date()) {
        // Return cached response
        logger.debug({ key: compositeKey }, 'Returning cached idempotent response');
        
        res.setHeader('X-Idempotency-Key', key);
        res.setHeader('X-Idempotency-Replayed', 'true');
        
        if (existing.response) {
          res.status(200).json(existing.response);
        } else {
          res.status(200).json({ success: true, cached: true });
        }
        return;
      }

      // Store key for this request
      await prisma.idempotencyKey.create({
        data: {
          key: compositeKey,
          userId,
          expiresAt: new Date(Date.now() + CACHE_TTL.IDEMPOTENCY_KEY),
        },
      });

      // Store response after request completes
      const originalJson = res.json.bind(res);
      res.json = function(body: unknown) {
        // Update stored key with response
        prisma.idempotencyKey.update({
          where: { key: compositeKey },
          data: { response: body as Prisma.InputJsonValue },
        }).catch((err) => {
          logger.error({ error: err }, 'Failed to cache idempotent response');
        });
        
        res.setHeader('X-Idempotency-Key', key);
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error({ error }, 'Idempotency check failed');
      next(error);
    }
  })();
}
