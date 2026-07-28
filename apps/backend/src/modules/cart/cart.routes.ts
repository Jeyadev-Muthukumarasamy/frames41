import { Router } from 'express';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { CartRepository } from './cart.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { generalRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { UploadController } from '../upload/upload.controller.js';
import { CouponService } from '../coupon/coupon.service.js';
import { ShippingService } from '../shipping/shipping.service.js';

/**
 * Create cart routes
 */
export function createCartRoutes(): Router {
  const router = Router();

  // Dependency injection
  const repository = new CartRepository(prisma);
  const service = new CartService(
    repository,
    new CouponService(),
    new ShippingService(),
  );
  const controller = new CartController(service);
  const uploadController = new UploadController();

  // All cart routes require authentication
  router.use(authenticate);
  router.use(generalRateLimiter);

  // Cart operations
  router.get('/', controller.getCart);
  router.post('/upload-photo', ...uploadController.uploadCustomizationImage);
  router.post('/items', controller.addToCart);
  router.patch('/items/:id', controller.updateCartItem);
  router.delete('/items/:id', controller.removeCartItem);
  router.delete('/', controller.clearCart);
  router.post('/calculate', controller.calculateCart);

  return router;
}

export default createCartRoutes;
