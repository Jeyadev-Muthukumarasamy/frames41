import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../shared/errors/AppError.js';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { USER_ROLES } from '../config/constants.js';
import type { AuthenticatedUser, JwtPayload } from '../shared/types/index.js';
import { userSessionCache } from '../infrastructure/cache/lru.cache.js';

/**
 * Extend Express Request type to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extract token from Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    
    if (decoded.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    const cached = userSessionCache.get(decoded.userId);
    const user = cached
      ? { id: decoded.userId, role: cached.role }
      : await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, role: true },
        });

    if (!user) throw new UnauthorizedError('User not found');
    if (!cached) {
      userSessionCache.set(decoded.userId, {
        role: user.role,
        lastActivity: Date.now(),
      });
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
      return;
    }
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractToken(req);
    
    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    
    if (decoded.type === 'access') {
      const cached = userSessionCache.get(decoded.userId);
      const user = cached
        ? { id: decoded.userId, role: cached.role }
        : await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true },
          });

      if (user) {
        if (!cached) {
          userSessionCache.set(decoded.userId, {
            role: user.role,
            lastActivity: Date.now(),
          });
        }
        req.user = {
          userId: user.id,
          role: user.role,
        };
      }
    }

    next();
  } catch {
    // Invalid token is OK for optional auth
    next();
  }
}

/**
 * Role-based access control middleware factory
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
}

/**
 * Require admin role
 */
export const requireAdmin = requireRole(USER_ROLES.ADMIN);
