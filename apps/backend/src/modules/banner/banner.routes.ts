import { Router } from 'express';
import { BannerController } from './banner.controller.js';
import { BannerService } from './banner.service.js';
import { BannerRepository } from './banner.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { authenticate, requireAdmin, optionalAuth } from '../../middleware/auth.middleware.js';
import { generalRateLimiter } from '../../middleware/rateLimit.middleware.js';

/**
 * Create banner routes
 */
export function createBannerRoutes(): Router {
  const router = Router();

  // Dependency injection
  const repository = new BannerRepository(prisma);
  const service = new BannerService(repository);
  const controller = new BannerController(service);

  // Public routes (optionalAuth so admins get includeInactive support)
  router.get('/', generalRateLimiter, optionalAuth, controller.getBanners);
  router.get('/by-type/:type', generalRateLimiter, controller.getBannersByType);
  router.get('/:id', generalRateLimiter, controller.getBannerById);

  // Admin only routes
  router.post('/', authenticate, requireAdmin, controller.createBanner);
  router.patch('/:id', authenticate, requireAdmin, controller.updateBanner);
  router.delete('/:id', authenticate, requireAdmin, controller.deleteBanner);

  return router;
}

export default createBannerRoutes;
