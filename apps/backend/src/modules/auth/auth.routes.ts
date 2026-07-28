import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';

/**
 * Create auth routes
 */
export function createAuthRoutes(): Router {
  const router = Router();

  // Dependency injection
  const repository = new AuthRepository(prisma);
  const service = new AuthService(repository);
  const controller = new AuthController(service);

  // Dashboard auth endpoint
  router.post('/dashboard-login', authRateLimiter, controller.dashboardLogin);

  // Phone auth endpoints
  router.post('/phone', authRateLimiter, controller.phoneLogin);
  router.post('/send-otp', authRateLimiter, controller.sendOtp);
  router.post('/verify-otp', authRateLimiter, controller.verifyOtp);


  // Token/session endpoints
  router.post('/refresh', authRateLimiter, controller.refreshToken);
  router.post('/logout', authRateLimiter, controller.logout);

  return router;
}

export default createAuthRoutes;