/**
 * Review routes
 */

import { Router } from 'express';
import { ReviewRepository } from './review.repository.js';
import { ReviewService } from './review.service.js';
import { ReviewController } from './review.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewParamsSchema,
  productReviewsQuerySchema,
  canReviewSchema,
} from './review.schema.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export default function createReviewRoutes(): Router {
  const router = Router();

  // Dependencies
  const repository = new ReviewRepository(prisma);
  const service = new ReviewService(repository);
  const controller = new ReviewController(service);

  // Admin routes (before auth middleware to allow specific ordering)
  router.get('/admin/pending', authenticate, requireAdmin, controller.getPendingReviews);
  router.patch('/:id/approve', authenticate, requireAdmin, controller.approveReview);
  router.delete('/:id/reject', authenticate, requireAdmin, controller.rejectReview);

  // Public routes
  router.get('/product/:productId', controller.getProductReviews);
  router.get('/product/:productId/summary', controller.getReviewSummary);
  router.post('/:id/helpful', validate(reviewParamsSchema), controller.markHelpful);

  // Protected routes
  router.use(authenticate);

  // User reviews
  router.get('/my-reviews', controller.getUserReviews);

  // Can review check
  router.get('/can-review', validate(canReviewSchema), controller.canReview);

  // Create review
  router.post('/', validate(createReviewSchema), controller.createReview);

  // Update review
  router.patch('/:id', validate(updateReviewSchema), controller.updateReview);

  // Delete review
  router.delete('/:id', validate(reviewParamsSchema), controller.deleteReview);

  return router;
}
