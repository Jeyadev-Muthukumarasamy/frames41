import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { env } from './config/env.js';
import { httpLogger } from './infrastructure/logger/pino.logger.js';
import { requestIdMiddleware } from './middleware/requestId.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { generalRateLimiter } from './middleware/rateLimit.middleware.js';
import { idempotencyMiddleware } from './middleware/idempotency.middleware.js';
import { auditMiddleware } from './middleware/audit.middleware.js';
import createAuthRoutes from './modules/auth/auth.routes.js';
import createUserRoutes from './modules/user/user.routes.js';
import createAdminRoutes from './modules/admin/admin.routes.js';
import createCategoryRoutes from './modules/category/category.routes.js';
import createProductRoutes from './modules/product/product.routes.js';
import createBannerRoutes from './modules/banner/banner.routes.js';
import createCartRoutes from './modules/cart/cart.routes.js';
import createOrderRoutes from './modules/order/order.routes.js';
import createPaymentRoutes from './modules/payment/payment.routes.js';
import createWebhookRoutes from './modules/webhook/webhook.routes.js';
import createBlogRoutes from './modules/blog/blog.routes.js';
import createFAQRoutes from './modules/faq/faq.routes.js';
import createNewsletterRoutes from './modules/newsletter/newsletter.routes.js';
import createBulkOrderRoutes from './modules/bulk-order/bulk-order.routes.js';
import createWishlistRoutes from './modules/wishlist/wishlist.routes.js';
import createReviewRoutes from './modules/review/review.routes.js';
import createAbandonedCartRoutes from './modules/abandoned-cart/abandoned-cart.routes.js';
import createReferralRoutes from './modules/referral/referral.routes.js';
import createGiftCardRoutes from './modules/giftcard/giftcard.routes.js';
import createHomeRoutes from './modules/home/home.routes.js';
import createCouponRoutes from './modules/coupon/coupon.routes.js';
import { sanitizeReviewBody, sanitizeBlogContent, sanitizeFaqContent } from './middleware/xss.middleware.js';

/**
 * Create Express application
 */
export function createApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // CORS
  const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'Idempotency-Key',
    ],
  }));

  // Compression
  app.use(compression());

  // Request ID
  app.use(requestIdMiddleware);

  // HTTP logging
  app.use(httpLogger);

  // Webhook routes need the raw request body for provider signature validation.
  app.use('/webhooks', createWebhookRoutes());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // General rate limiting
  app.use(generalRateLimiter);

  // Idempotency
  app.use(idempotencyMiddleware);

  // Audit logging for mutations
  app.use(auditMiddleware);

  // Health check endpoint
  app.get('/health', async (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // API routes
  const apiPrefix = `/api/${env.API_VERSION}`;

  app.use(apiPrefix, (req, res, next) => {
    const publicReadPrefixes = [
      '/products',
      '/categories',
      '/banners',
      '/blog',
      '/faqs',
      '/reviews/product',
    ];
    if (
      req.method === 'GET' &&
      !req.headers.authorization &&
      publicReadPrefixes.some((prefix) => req.path.startsWith(prefix))
    ) {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    }
    next();
  });

  // Auth routes
  app.use(`${apiPrefix}/auth`, createAuthRoutes());

  // User routes
  app.use(`${apiPrefix}/users`, createUserRoutes());

  // Admin routes
  app.use(`${apiPrefix}/admin`, createAdminRoutes());

  // Catalog routes (Phase 2)
  app.use(`${apiPrefix}/home`, createHomeRoutes());
  app.use(`${apiPrefix}/categories`, createCategoryRoutes());
  app.use(`${apiPrefix}/products`, createProductRoutes());
  app.use(`${apiPrefix}/banners`, createBannerRoutes());

  // Commerce routes (Phase 3)
  app.use(`${apiPrefix}/cart`, createCartRoutes());
  app.use(`${apiPrefix}/admin/coupons`, createCouponRoutes());

  // Checkout routes (Phase 4)
  app.use(`${apiPrefix}/orders`, createOrderRoutes());
  app.use(`${apiPrefix}/payments`, createPaymentRoutes());

  // Engagement routes (Phase 5)
  app.use(`${apiPrefix}/wishlist`, createWishlistRoutes());
  app.use(`${apiPrefix}/reviews`, sanitizeReviewBody, createReviewRoutes());
  app.use(`${apiPrefix}/abandoned-cart`, createAbandonedCartRoutes());
  app.use(`${apiPrefix}/referrals`, createReferralRoutes());
  app.use(`${apiPrefix}/gift-cards`, createGiftCardRoutes());

  // Content routes (Phase 6)
  app.use(`${apiPrefix}/blog`, sanitizeBlogContent, createBlogRoutes());
  app.use(`${apiPrefix}/faqs`, sanitizeFaqContent, createFAQRoutes());
  app.use(`${apiPrefix}/newsletter`, createNewsletterRoutes());
  app.use(`${apiPrefix}/bulk-orders`, createBulkOrderRoutes());

  // API Documentation endpoint (Phase 8)
  app.get('/api/docs', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        name: env.APP_NAME,
        version: '1.0.0',
        baseUrl: `${env.APP_URL}/api/${env.API_VERSION}`,
        documentation: 'Swagger/OpenAPI spec available at /api/docs/openapi.json',
        endpoints: {
          auth: `${apiPrefix}/auth`,
          users: `${apiPrefix}/users`,
          admin: `${apiPrefix}/admin`,
          products: `${apiPrefix}/products`,
          categories: `${apiPrefix}/categories`,
          cart: `${apiPrefix}/cart`,
          orders: `${apiPrefix}/orders`,
          payments: `${apiPrefix}/payments`,
          wishlist: `${apiPrefix}/wishlist`,
          reviews: `${apiPrefix}/reviews`,
          referrals: `${apiPrefix}/referrals`,
          giftCards: `${apiPrefix}/gift-cards`,
          webhooks: '/webhooks',
        },
      },
      meta: { timestamp: new Date().toISOString() },
    });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}

export default createApp;
