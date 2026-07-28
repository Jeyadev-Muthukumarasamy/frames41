import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { ProductService } from './product.service.js';
import { ProductRepository } from './product.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { generalRateLimiter, searchRateLimiter } from '../../middleware/rateLimit.middleware.js';

/**
 * Create product routes
 */
export function createProductRoutes(): Router {
  const router = Router();

  router.use((req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    }
    next();
  });

  // Dependency injection
  const repository = new ProductRepository(prisma);
  const service = new ProductService(repository);
  const controller = new ProductController(service);

  // Public routes
  router.get('/', generalRateLimiter, controller.getProducts);
  router.get('/search', searchRateLimiter, controller.searchProducts);
  router.get('/under-price/:amount', generalRateLimiter, controller.getProductsUnderPrice);
  router.get('/by-slug/:slug', generalRateLimiter, controller.getProductBySlug);
  router.get('/:id', generalRateLimiter, controller.getProductById);

  // Admin only routes
  router.post('/', authenticate, requireAdmin, controller.createProduct);
  router.patch('/:id', authenticate, requireAdmin, controller.updateProduct);
  router.delete('/:id', authenticate, requireAdmin, controller.deleteProduct);

  return router;
}

export default createProductRoutes;
