import { Router } from 'express';
import { NewsletterController } from './newsletter.controller.js';
import { NewsletterService } from './newsletter.service.js';
import { NewsletterRepository } from './newsletter.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { generalRateLimiter } from '../../middleware/rateLimit.middleware.js';

/**
 * Create newsletter routes
 */
export function createNewsletterRoutes(): Router {
  const router = Router();

  // Dependency injection
  const repository = new NewsletterRepository(prisma);
  const service = new NewsletterService(repository);
  const controller = new NewsletterController(service);

  // Public routes
  router.post('/subscribe', generalRateLimiter, controller.subscribe);
  router.post('/unsubscribe', generalRateLimiter, controller.unsubscribe);

  // Admin only routes
  router.get('/count', authenticate, requireAdmin, controller.getSubscriberCount);

  return router;
}

export default createNewsletterRoutes;
