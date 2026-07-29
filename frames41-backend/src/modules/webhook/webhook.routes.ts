import { Router } from 'express';
import { handleRazorpayWebhook } from './razorpay.webhook.js';
import { raw } from 'express';

/**
 * Create webhook routes
 */
export function createWebhookRoutes(): Router {
  const router = Router();

  // Razorpay webhook - needs raw body for signature verification
  router.post(
    '/razorpay',
    raw({ type: 'application/json' }),
    handleRazorpayWebhook,
  );

  return router;
}

export default createWebhookRoutes;
