import { Router } from 'express';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';
import { CategoryRepository } from './category.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { authenticate, requireAdmin, optionalAuth } from '../../middleware/auth.middleware.js';
import { generalRateLimiter } from '../../middleware/rateLimit.middleware.js';

/**
 * Create category routes
 */
export function createCategoryRoutes(): Router {
  const router = Router();

  // Dependency injection
  const repository = new CategoryRepository(prisma);
  const service = new CategoryService(repository);
  const controller = new CategoryController(service);

  // Public routes
  router.get('/tree', generalRateLimiter, optionalAuth, controller.getCategoryTree);
  router.get('/by-slug/:slug', generalRateLimiter, controller.getCategoryBySlug);
  router.get('/:id', generalRateLimiter, controller.getCategoryById);

  // Admin only routes
  router.post('/', authenticate, requireAdmin, controller.createCategory);
  router.patch('/:id', authenticate, requireAdmin, controller.updateCategory);
  router.delete('/:id', authenticate, requireAdmin, controller.deleteCategory);

  return router;
}

export default createCategoryRoutes;
