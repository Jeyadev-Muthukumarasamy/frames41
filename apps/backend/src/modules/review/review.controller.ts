/**
 * Review controller
 */

import type { Request, Response, NextFunction } from 'express';
import type { IReviewService } from './review.types.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class ReviewController {
  private readonly service: IReviewService;

  constructor(service: IReviewService) {
    this.service = service;
  }

  /**
   * Get product reviews
   */
  getProductReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const approvedOnly = req.query.approvedOnly !== 'false';

      const result = await this.service.getProductReviews(productId, {
        page,
        limit,
        approvedOnly,
      });

      res.status(200).json({
        success: true,
        data: result.reviews,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          summary: result.summary,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user reviews
   */
  getUserReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

      const result = await this.service.getUserReviews(userId, { page, limit });

      res.status(200).json({
        success: true,
        data: result.reviews,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create review
   */
  createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const review = await this.service.createReview(userId, req.body);

      res.status(201).json({
        success: true,
        data: review,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update review
   */
  updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { id } = req.params;
      const review = await this.service.updateReview(userId, id, req.body);

      res.status(200).json({
        success: true,
        data: review,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete review
   */
  deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { id } = req.params;
      await this.service.deleteReview(userId, id);

      res.status(200).json({
        success: true,
        data: { message: 'Review deleted' },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * [Admin] Get pending reviews
   */
  getPendingReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const result = await this.service.getPendingReviews({ page, limit });
      res.status(200).json({
        success: true,
        data: result.reviews,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * [Admin] Approve a review
   */
  approveReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.approveReview(id);
      res.status(200).json({
        success: true,
        data: { message: 'Review approved' },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * [Admin] Reject (delete) a review
   */
  rejectReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.rejectReview(id);
      res.status(200).json({
        success: true,
        data: { message: 'Review rejected' },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark review as helpful
   */
  markHelpful = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.markHelpful(id);

      res.status(200).json({
        success: true,
        data: { message: 'Review marked as helpful' },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get review summary for a product
   */
  getReviewSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const summary = await this.service.getReviewSummary(productId);

      res.status(200).json({
        success: true,
        data: summary,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if user can review a product
   */
  canReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { productId, orderId } = req.query;
      if (!productId || typeof productId !== 'string') {
        throw new BadRequestError('Product ID is required');
      }

      const result = await this.service.canReviewProduct(
        userId,
        productId,
        typeof orderId === 'string' ? orderId : undefined,
      );

      res.status(200).json({
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
}
