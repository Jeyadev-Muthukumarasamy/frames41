import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { generalRateLimiter, orderRateLimiter } from '../../middleware/rateLimit.middleware.js';

/**
 * Create payment routes
 */
export function createPaymentRoutes(): Router {
  const router = Router();

  // Dependency injection
  const service = new PaymentService();
  const controller = new PaymentController(service);

  // Apply authentication
  router.use(authenticate);
  router.use(generalRateLimiter);

  // Payment operations
  router.post('/create', orderRateLimiter, controller.createPayment);
  router.post('/verify', orderRateLimiter, controller.verifyPayment);
  router.post('/cash-on-delivery', orderRateLimiter, controller.cashOnDelivery);
  router.get('/order/:orderId', controller.getPaymentByOrderId);

  return router;
}

export default createPaymentRoutes;
