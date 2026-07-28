import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';
import { OrderRepository } from './order.repository.js';
import { PricingEngine } from '../cart/pricing.engine.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { generalRateLimiter } from '../../middleware/rateLimit.middleware.js';

/**
 * Create order routes
 */
export function createOrderRoutes(): Router {
  const router = Router();

  // Dependency injection
  const repository = new OrderRepository(prisma);
  const service = new OrderService(repository, PricingEngine);
  const controller = new OrderController(service);

  // All order routes require authentication
  router.use(authenticate);
  router.use(generalRateLimiter);

  // Order operations
  router.post('/', controller.createOrder);
  router.get('/', controller.getUserOrders);
  router.get('/by-number/:orderNumber', controller.getOrderByNumber);
  router.get('/:id', controller.getOrderById);
  router.patch('/:id/status', requireAdmin, controller.updateOrderStatus);
  router.post('/:id/refund', controller.requestRefund);
  router.post('/:id/cancel', controller.cancelOrder);

  return router;
}

export default createOrderRoutes;
