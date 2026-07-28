import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../shared/errors/AppError.js';

/**
 * RBAC middleware factory
 * Checks if user has required role/permission
 */
export function requirePermission(
  permissionCheck: (user: NonNullable<Request['user']>) => boolean | Promise<boolean>,
  errorMessage = 'Insufficient permissions',
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    try {
      const hasPermission = await permissionCheck(req.user);
      
      if (!hasPermission) {
        next(new ForbiddenError(errorMessage));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user owns resource or is admin
 */
export function requireOwnershipOrAdmin(
  getResourceOwnerId: (req: Request) => string | Promise<string>,
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    try {
      // Admin can access anything
      if (req.user.role === 'ADMIN') {
        next();
        return;
      }

      const ownerId = await getResourceOwnerId(req);
      
      if (ownerId !== req.user.userId) {
        next(new ForbiddenError('You do not have permission to access this resource'));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
