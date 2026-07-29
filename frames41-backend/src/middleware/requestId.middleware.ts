import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

/**
 * Request ID middleware
 * Generates or propagates request IDs for tracing
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Check for existing request ID from upstream (load balancer, etc.)
  const existingId = req.headers['x-request-id'];
  
  // Generate new ID if not present
  const requestId = typeof existingId === 'string' && existingId.length > 0
    ? existingId
    : randomUUID();
  
  // Set request ID on request object
  req.headers['x-request-id'] = requestId;
  
  // Add to response headers
  res.setHeader('X-Request-Id', requestId);
  
  next();
}
