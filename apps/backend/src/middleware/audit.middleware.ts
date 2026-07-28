import type { NextFunction, Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { logger } from '../infrastructure/logger/pino.logger.js';

/**
 * Audit log middleware
 * Logs sensitive operations to the audit log table
 * Should be applied after authentication middleware
 */
export function createAuditMiddleware(
  options: {
    actions: string[];
    getResource?: (req: Request) => { resource: string; resourceId?: string };
    getMetadata?: (req: Request, res: Response) => Record<string, unknown>;
  },
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Store original end function
    const originalEnd = res.end.bind(res);
    const chunks: Buffer[] = [];

    // Override res.end to capture response
    res.end = function(chunk: unknown, ...args: unknown[]): Response {
      if (chunk) {
        chunks.push(Buffer.from(chunk as string));
      }
      return originalEnd(chunk as string, ...(args as [() => void]));
    };

    // Process after response is sent
    res.on('finish', async () => {
      try {
        const requestId = req.headers['x-request-id'] as string || 'unknown';
        const userId = req.user?.userId;
        
        // Get action from route or request
        const action = req.method + ' ' + req.route?.path || req.path;
        
        // Get resource info
        const resourceInfo = options.getResource?.(req) || {
          resource: req.path.split('/')[1] || 'unknown',
          resourceId: req.params.id,
        };

        // Get metadata
        const metadata = options.getMetadata?.(req, res) || {
          statusCode: res.statusCode,
          query: Object.keys(req.query).length > 0 ? req.query : undefined,
        };

        // Log to database
        await prisma.auditLog.create({
          data: {
            userId,
            action,
            resource: resourceInfo.resource,
            resourceId: resourceInfo.resourceId,
            metadata: metadata as Prisma.InputJsonObject,
            ipAddress: req.ip || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            requestId,
          },
        });

        logger.debug({ requestId, action }, 'Audit log created');
      } catch (error) {
        logger.error({ error }, 'Failed to create audit log');
      }
    });

    next();
  };
}

/**
 * Simple audit middleware that logs all requests
 */
export async function auditMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Skip if no user (unauthenticated)
  if (!req.user) {
    next();
    return;
  }

  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      // Only log mutations (POST, PUT, PATCH, DELETE) or errors
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode < 400) {
        return;
      }

      await prisma.auditLog.create({
        data: {
          userId: req.user?.userId,
          action: `${req.method} ${req.route?.path || req.path}`,
          resource: req.path.split('/')[1] || 'unknown',
          resourceId: req.params.id,
          metadata: {
            statusCode: res.statusCode,
            duration: Date.now() - startTime,
          },
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          requestId,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Audit logging failed');
    }
  });

  next();
}
