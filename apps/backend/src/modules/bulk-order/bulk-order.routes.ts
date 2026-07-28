import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { BulkOrderController } from './bulk-order.controller.js';
import { BulkOrderRepository } from './bulk-order.repository.js';

export function createBulkOrderRoutes(): Router {
  const router = Router();
  const controller = new BulkOrderController(new BulkOrderRepository(prisma));

  router.post('/', controller.create);

  return router;
}

export default createBulkOrderRoutes;
