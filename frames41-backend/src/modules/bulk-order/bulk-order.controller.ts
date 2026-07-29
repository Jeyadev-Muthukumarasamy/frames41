import type { NextFunction, Request, Response } from 'express';
import { createBulkOrderSchema } from './bulk-order.schema.js';
import { BulkOrderRepository } from './bulk-order.repository.js';

export class BulkOrderController {
  constructor(private readonly repository: BulkOrderRepository) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = createBulkOrderSchema.parse(req.body);
      const request = await this.repository.create(input);

      res.status(201).json({
        success: true,
        data: {
          id: request.id,
          message: 'Bulk order request submitted successfully',
        },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
