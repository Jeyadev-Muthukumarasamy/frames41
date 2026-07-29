import { Router } from 'express';
import { BlogController } from './blog.controller.js';
import { BlogService } from './blog.service.js';
import { BlogRepository } from './blog.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { generalRateLimiter } from '../../middleware/rateLimit.middleware.js';

/**
 * Create blog routes
 */
export function createBlogRoutes(): Router {
  const router = Router();

  // Dependency injection
  const repository = new BlogRepository(prisma);
  const service = new BlogService(repository);
  const controller = new BlogController(service);

  // Public routes
  router.get('/', generalRateLimiter, controller.getBlogPosts);
  router.get('/by-slug/:slug', generalRateLimiter, controller.getBlogPostBySlug);
  router.get('/:id', generalRateLimiter, controller.getBlogPostById);

  // Admin only routes
  router.post('/', authenticate, requireAdmin, controller.createBlogPost);
  router.patch('/:id', authenticate, requireAdmin, controller.updateBlogPost);
  router.delete('/:id', authenticate, requireAdmin, controller.deleteBlogPost);

  return router;
}

export default createBlogRoutes;
