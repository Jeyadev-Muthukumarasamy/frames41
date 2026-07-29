/**
 * Gift card routes
 */

import { Router } from 'express';
import { GiftCardRepository } from './giftcard.repository.js';
import { GiftCardService } from './giftcard.service.js';
import { GiftCardController } from './giftcard.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createGiftCardSchema,
  giftCardCodeSchema,
  validateGiftCardSchema,
  redeemGiftCardSchema,
} from './giftcard.schema.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export default function createGiftCardRoutes(): Router {
  const router = Router();

  // Dependencies
  const repository = new GiftCardRepository(prisma);
  const service = new GiftCardService(repository);
  const controller = new GiftCardController(service);

  // Public routes
  router.get('/check/:code', validate(giftCardCodeSchema), controller.getGiftCard);
  router.get('/validate', validate(validateGiftCardSchema), controller.validateGiftCard);

  // Protected routes
  router.use(authenticate);

  // My gift cards
  router.get('/my-cards', controller.getMyGiftCards);

  // Get gift card balance (full details)
  router.get('/balance/:code', validate(giftCardCodeSchema), controller.getGiftCardBalance);

  // Create gift card
  router.post('/', validate(createGiftCardSchema), controller.createGiftCard);

  // Redeem gift card
  router.post('/redeem', validate(redeemGiftCardSchema), controller.redeemGiftCard);

  return router;
}
