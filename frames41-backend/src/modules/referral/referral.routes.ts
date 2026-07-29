/**
 * Referral routes
 */

import { Router } from 'express';
import { ReferralRepository } from './referral.repository.js';
import { ReferralService } from './referral.service.js';
import { ReferralController } from './referral.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createReferralCodeSchema,
  getByCodeSchema,
  validateReferralSchema,
} from './referral.schema.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export default function createReferralRoutes(): Router {
  const router = Router();

  // Dependencies
  const repository = new ReferralRepository(prisma);
  const service = new ReferralService(repository);
  const controller = new ReferralController(service);

  // Public routes
  router.get('/code/:code', validate(getByCodeSchema), controller.getReferralCode);
  router.get('/stats/:code', controller.getReferralStats);

  // Protected routes
  router.use(authenticate);

  // My referral code
  router.get('/my-code', controller.getMyReferralCode);

  // Validate referral code
  router.get('/validate', validate(validateReferralSchema), controller.validateReferralCode);

  // Create referral code
  router.post('/', validate(createReferralCodeSchema), controller.createReferralCode);

  // My referral history
  router.get('/my-history', controller.getMyReferralHistory);

  return router;
}
