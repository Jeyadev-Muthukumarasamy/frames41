/**
 * Abandoned cart trigger controller
 */

import type { Request, Response, NextFunction } from 'express';
import type { IAbandonedCartTriggerService } from './abandoned-cart.types.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class AbandonedCartTriggerController {
  private readonly service: IAbandonedCartTriggerService;

  constructor(service: IAbandonedCartTriggerService) {
    this.service = service;
  }

  /**
   * Track product view
   */
  trackView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { productId } = req.params;
      await this.service.trackProductView(userId, productId);

      res.status(200).json({
        success: true,
        data: { message: 'View tracked' },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Track product exit
   */
  trackExit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { productId } = req.params;
      await this.service.trackProductExit(userId, productId);

      res.status(200).json({
        success: true,
        data: { message: 'Exit tracked' },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
