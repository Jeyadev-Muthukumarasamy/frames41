import { Router } from 'express';
import { FAQController } from './faq.controller.js';
import { FAQService } from './faq.service.js';
import { FAQRepository } from './faq.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { generalRateLimiter } from '../../middleware/rateLimit.middleware.js';

/**
 * Create FAQ routes
 */
export function createFAQRoutes(): Router {
  const router = Router();

  // Dependency injection
  const repository = new FAQRepository(prisma);
  const service = new FAQService(repository);
  const controller = new FAQController(service);

  // Public routes
  router.get('/', generalRateLimiter, controller.getFAQs);
  router.get('/categories', generalRateLimiter, controller.getCategories);
  router.get('/category/:category', generalRateLimiter, controller.getFAQsByCategory);
  router.get('/:id', generalRateLimiter, controller.getFAQById);

  // Admin only routes
  router.post('/', authenticate, requireAdmin, controller.createFAQ);
  router.patch('/:id', authenticate, requireAdmin, controller.updateFAQ);
  router.delete('/:id', authenticate, requireAdmin, controller.deleteFAQ);

  return router;
}

export default createFAQRoutes;
