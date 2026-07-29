/**
 * Wishlist controller
 */

import type { Request, Response, NextFunction } from 'express';
import type { IWishlistService } from './wishlist.types.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class WishlistController {
  private readonly service: IWishlistService;

  constructor(service: IWishlistService) {
    this.service = service;
  }

  /**
   * Get user's wishlist
   */
  getWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const wishlist = await this.service.getWishlist(userId);

      res.status(200).json({
        success: true,
        data: wishlist,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add product to wishlist
   */
  addToWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { productId } = req.body;
      const wishlist = await this.service.addToWishlist(userId, productId);

      res.status(201).json({
        success: true,
        data: wishlist,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove product from wishlist
   */
  removeFromWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { productId } = req.params;
      const wishlist = await this.service.removeFromWishlist(userId, productId);

      res.status(200).json({
        success: true,
        data: wishlist,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Toggle wishlist item (add if not exists, remove if exists)
   */
  toggleWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { productId } = req.body;
      const result = await this.service.toggleWishlistItem(userId, productId);

      res.status(result.added ? 201 : 200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Clear entire wishlist
   */
  clearWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      await this.service.clearWishlist(userId);

      res.status(200).json({
        success: true,
        data: { message: 'Wishlist cleared' },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if product is in wishlist
   */
  checkWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { productId } = req.query;
      if (!productId || typeof productId !== 'string') {
        throw new BadRequestError('Product ID is required');
      }

      const isInWishlist = await this.service.isInWishlist(userId, productId);

      res.status(200).json({
        success: true,
        data: { isInWishlist },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
