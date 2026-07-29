/**
 * Referral controller
 */

import type { Request, Response, NextFunction } from 'express';
import type { IReferralService } from './referral.types.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class ReferralController {
  private readonly service: IReferralService;

  constructor(service: IReferralService) {
    this.service = service;
  }

  /**
   * Get referral code by code
   */
  getReferralCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.params;
      const referralCode = await this.service.getReferralCode(code);

      if (!referralCode) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Referral code not found',
          },
          meta: { timestamp: new Date().toISOString() },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: referralCode,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's referral code
   */
  getMyReferralCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const referralCode = await this.service.getUserReferralCode(userId);

      if (!referralCode) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'You do not have a referral code yet',
          },
          meta: { timestamp: new Date().toISOString() },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: referralCode,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create referral code
   */
  createReferralCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const referralCode = await this.service.createReferralCode(userId ?? null, req.body);

      res.status(201).json({
        success: true,
        data: referralCode,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate referral code
   */
  validateReferralCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        throw new BadRequestError('Code is required');
      }

      const result = await this.service.validateReferralCode(code, userId);

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get referral stats
   */
  getReferralStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.params;
      const stats = await this.service.getReferralStats(code);

      res.status(200).json({
        success: true,
        data: stats,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's referral history
   */
  getMyReferralHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const history = await this.service.getUserReferralHistory(userId);

      res.status(200).json({
        success: true,
        data: history,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}
