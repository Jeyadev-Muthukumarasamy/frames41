import { Router } from 'express';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { UserRepository } from './user.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { generalRateLimiter } from '../../middleware/rateLimit.middleware.js';

/**
 * Create user routes
 */
export function createUserRoutes(): Router {
  const router = Router();

  // Dependency injection
  const repository = new UserRepository(prisma);
  const service = new UserService(repository);
  const controller = new UserController(service);

  // Apply auth middleware to all routes
  router.use(authenticate);
  router.use(generalRateLimiter);

  // Profile routes
  router.get('/me', controller.getProfile);
  router.patch('/me', controller.updateProfile);

  // Address routes
  router.get('/me/addresses', controller.getAddresses);
  router.post('/me/addresses', controller.createAddress);
  router.get('/me/addresses/:id', controller.getAddress);
  router.patch('/me/addresses/:id', controller.updateAddress);
  router.delete('/me/addresses/:id', controller.deleteAddress);

  return router;
}

export default createUserRoutes;
