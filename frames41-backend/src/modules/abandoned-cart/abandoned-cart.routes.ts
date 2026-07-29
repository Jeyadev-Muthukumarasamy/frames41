/**
 * Abandoned cart trigger routes
 */

import { Router } from 'express';
import { AbandonedCartTriggerRepository } from './abandoned-cart.repository.js';
import { AbandonedCartTriggerService } from './abandoned-cart.service.js';
import { AbandonedCartTriggerController } from './abandoned-cart.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { trackViewSchema, trackExitSchema } from './abandoned-cart.schema.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export default function createAbandonedCartRoutes(): Router {
  const router = Router();

  // Dependencies
  const repository = new AbandonedCartTriggerRepository(prisma);
  const service = new AbandonedCartTriggerService(repository);
  const controller = new AbandonedCartTriggerController(service);

  // All routes require authentication
  router.use(authenticate);

  // Track product view
  router.post('/view/:productId', validate(trackViewSchema), controller.trackView);

  // Track product exit
  router.post('/exit/:productId', validate(trackExitSchema), controller.trackExit);

  return router;
}
