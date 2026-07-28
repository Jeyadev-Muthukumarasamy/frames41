/**
 * Admin routes
 */

import { Router } from 'express';
import { AdminRepository } from './admin.repository.js';
import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';
import { UploadController } from '../upload/upload.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  dashboardQuerySchema,
  analyticsQuerySchema,
  topProductsQuerySchema,
  customerListQuerySchema,
  customerParamsSchema,
  orderListQuerySchema,
  orderParamsSchema,
  updateOrderStatusSchema,
  addTrackingSchema,
  refundListQuerySchema,
  refundParamsSchema,
  processRefundSchema,
  lowStockQuerySchema,
} from './admin.schema.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export function createAdminRoutes(): Router {
  const router = Router();

  // Dependencies
  const repository = new AdminRepository(prisma);
  const service = new AdminService(repository);
  const controller = new AdminController(service);
  const uploadController = new UploadController();

  // All admin routes require authentication + admin role
  router.use(authenticate);
  router.use(requireAdmin);

  // Dashboard
  router.get('/dashboard/stats', controller.getDashboardStats);
  router.get('/dashboard/analytics', validate(analyticsQuerySchema), controller.getAnalytics);
  router.get('/dashboard/top-products', validate(topProductsQuerySchema), controller.getTopProducts);

  // Customers
  router.get('/customers', validate(customerListQuerySchema), controller.getCustomers);
  router.get('/customers/:id', validate(customerParamsSchema), controller.getCustomerById);

  // Orders
  router.get('/orders', validate(orderListQuerySchema), controller.getOrders);
  router.get('/orders/:id', validate(orderParamsSchema), controller.getOrderById);
  router.patch('/orders/:id/status', validate(updateOrderStatusSchema), controller.updateOrderStatus);
  router.post('/orders/:id/tracking', validate(addTrackingSchema), controller.addTracking);

  // Refunds
  router.get('/refunds', validate(refundListQuerySchema), controller.getRefunds);
  router.patch('/refunds/:id', validate(processRefundSchema), controller.processRefund);

  // Upload
  router.post('/upload', ...uploadController.uploadImage);

  return router;
}

export default createAdminRoutes;
