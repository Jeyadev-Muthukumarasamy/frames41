/**
 * Wishlist routes
 */

import { Router } from 'express';
import { WishlistRepository } from './wishlist.repository.js';
import { WishlistService } from './wishlist.service.js';
import { WishlistController } from './wishlist.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  addToWishlistSchema,
  removeFromWishlistSchema,
  toggleWishlistSchema,
  checkWishlistSchema,
} from './wishlist.schema.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export default function createWishlistRoutes(): Router {
  const router = Router();

  // Dependencies
  const repository = new WishlistRepository(prisma);
  const service = new WishlistService(repository);
  const controller = new WishlistController(service);

  // All wishlist routes require authentication
  router.use(authenticate);

  // Get wishlist
  router.get('/', controller.getWishlist);

  // Check if product is in wishlist
  router.get('/check', validate(checkWishlistSchema), controller.checkWishlist);

  // Add to wishlist
  router.post('/', validate(addToWishlistSchema), controller.addToWishlist);

  // Toggle wishlist item
  router.post('/toggle', validate(toggleWishlistSchema), controller.toggleWishlist);

  // Remove from wishlist
  router.delete('/:productId', validate(removeFromWishlistSchema), controller.removeFromWishlist);

  // Clear wishlist
  router.delete('/', controller.clearWishlist);

  return router;
}
