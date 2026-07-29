/**
 * Gift card controller
 */

import type { Request, Response, NextFunction } from 'express';
import type { IGiftCardService } from './giftcard.types.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class GiftCardController {
  private readonly service: IGiftCardService;

  constructor(service: IGiftCardService) {
    this.service = service;
  }

  /**
   * Get gift card by code (public - limited info)
   */
  getGiftCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.params;
      const giftCard = await this.service.getGiftCard(code);

      if (!giftCard) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Gift card not found',
          },
          meta: { timestamp: new Date().toISOString() },
        });
        return;
      }

      // Return limited info for public endpoint
      res.status(200).json({
        success: true,
        data: {
          code: giftCard.code,
          balance: giftCard.balance,
          isActive: giftCard.isActive,
          isRedeemed: giftCard.isRedeemed,
          expiresAt: giftCard.expiresAt,
        },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get gift card balance (full details)
   */
  getGiftCardBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { code } = req.params;
      const giftCard = await this.service.getGiftCardBalance(code, userId);

      res.status(200).json({
        success: true,
        data: giftCard,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create gift card
   */
  createGiftCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const giftCard = await this.service.createGiftCard(userId ?? null, req.body);

      res.status(201).json({
        success: true,
        data: giftCard,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate gift card
   */
  validateGiftCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        throw new BadRequestError('Code is required');
      }

      const result = await this.service.validateGiftCard(code);

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
   * Redeem gift card
   */
  redeemGiftCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const { code } = req.body;
      const giftCard = await this.service.redeemGiftCard(code, userId);

      res.status(200).json({
        success: true,
        data: giftCard,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get my gift cards (purchased and redeemed)
   */
  getMyGiftCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User ID required');
      }

      const giftCards = await this.service.getMyGiftCards(userId);

      res.status(200).json({
        success: true,
        data: giftCards,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}
