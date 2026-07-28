/**
 * Gift card service implementation
 */

import type {
  IGiftCardService,
  IGiftCardRepository,
  GiftCardData,
  GiftCardBalanceData,
  CreateGiftCardInput,
  ValidateGiftCardResult,
} from './giftcard.types.js';
import { NotFoundError, ConflictError, BadRequestError, ForbiddenError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import crypto from 'crypto';

export class GiftCardService implements IGiftCardService {
  private readonly repository: IGiftCardRepository;

  constructor(repository: IGiftCardRepository) {
    this.repository = repository;
  }

  async getGiftCard(code: string): Promise<GiftCardData | null> {
    const giftCard = await this.repository.findByCode(code);
    if (!giftCard) return null;

    return this.mapToGiftCardData(giftCard);
  }

  async getGiftCardBalance(code: string, userId: string): Promise<GiftCardBalanceData> {
    const giftCard = await this.repository.findByCode(code);
    if (!giftCard) {
      throw new NotFoundError('Gift card');
    }

    // Only purchaser or redeemer can view full details
    if (giftCard.purchasedBy !== userId && giftCard.redeemedBy !== userId) {
      throw new ForbiddenError('You do not have access to this gift card');
    }

    return this.mapToGiftCardBalanceData(giftCard);
  }

  async createGiftCard(userId: string | null, data: CreateGiftCardInput): Promise<GiftCardData> {
    // Generate unique code
    const code = this.generateGiftCardCode();

    const giftCard = await this.repository.create({
      ...data,
      code,
      purchasedBy: userId || undefined,
      initialBalance: data.balance,
    });

    logger.info({ giftCardId: giftCard.id, code: giftCard.code }, 'Gift card created');

    return this.mapToGiftCardData(giftCard);
  }

  async validateGiftCard(code: string): Promise<ValidateGiftCardResult> {
    const giftCard = await this.repository.findByCode(code);

    if (!giftCard) {
      return { valid: false, message: 'Invalid gift card code' };
    }

    if (!giftCard.isActive) {
      return { valid: false, message: 'Gift card is not active' };
    }

    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
      return { valid: false, message: 'Gift card has expired' };
    }

    if (Number(giftCard.balance) <= 0) {
      return { valid: false, message: 'Gift card has no remaining balance' };
    }

    return {
      valid: true,
      giftCardId: giftCard.id,
      balance: Number(giftCard.balance),
    };
  }

  async redeemGiftCard(code: string, userId: string): Promise<GiftCardData> {
    const giftCard = await this.repository.findByCode(code);

    if (!giftCard) {
      throw new NotFoundError('Gift card');
    }

    if (!giftCard.isActive) {
      throw new BadRequestError('Gift card is not active');
    }

    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
      throw new BadRequestError('Gift card has expired');
    }

    if (giftCard.isRedeemed) {
      // If already redeemed by this user, just return the gift card
      if (giftCard.redeemedBy === userId) {
        return this.mapToGiftCardData(giftCard);
      }
      throw new ConflictError('Gift card has already been redeemed');
    }

    // Redeem the gift card
    const redeemedCard = await this.repository.redeem(giftCard.id, userId);

    // Create transaction record
    await this.repository.createTransaction({
      giftCardId: giftCard.id,
      type: 'REDEMPTION',
      amount: 0,
      description: 'Gift card redeemed',
    });

    logger.info({ giftCardId: giftCard.id, userId }, 'Gift card redeemed');

    return this.mapToGiftCardData(redeemedCard);
  }

  async applyGiftCard(
    giftCardId: string,
    orderId: string,
    amount: number,
  ): Promise<{ appliedAmount: number; remainingBalance: number }> {
    const giftCard = await this.repository.findById(giftCardId);

    if (!giftCard) {
      throw new NotFoundError('Gift card');
    }

    if (!giftCard.isActive) {
      throw new BadRequestError('Gift card is not active');
    }

    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
      throw new BadRequestError('Gift card has expired');
    }

    const currentBalance = Number(giftCard.balance);
    
    if (currentBalance <= 0) {
      throw new BadRequestError('Gift card has no remaining balance');
    }

    // Calculate how much to apply
    const appliedAmount = Math.min(amount, currentBalance);
    const remainingBalance = currentBalance - appliedAmount;

    // Deduct balance
    await this.repository.deductBalance(giftCardId, appliedAmount);

    // Create transaction record
    await this.repository.createTransaction({
      giftCardId,
      type: 'PARTIAL_USE',
      amount: appliedAmount,
      description: `Applied to order ${orderId}`,
      orderId,
    });

    // If balance is 0, deactivate
    if (remainingBalance <= 0) {
      await this.repository.deactivate(giftCardId);
    }

    logger.info({
      giftCardId,
      orderId,
      appliedAmount,
      remainingBalance,
    }, 'Gift card applied to order');

    return { appliedAmount, remainingBalance };
  }

  async getMyGiftCards(userId: string): Promise<{ purchased: GiftCardData[]; redeemed: GiftCardData[] }> {
    const [purchased, redeemed] = await Promise.all([
      this.repository.findByPurchaser(userId),
      this.repository.findByRedeemer(userId),
    ]);

    return {
      purchased: purchased.map((gc) => this.mapToGiftCardData(gc)),
      redeemed: redeemed.map((gc) => this.mapToGiftCardData(gc)),
    };
  }

  private generateGiftCardCode(): string {
    // Generate a 16-character alphanumeric code in groups of 4
    const bytes = crypto.randomBytes(8);
    const code = bytes.toString('hex').toUpperCase();
    return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}-${code.slice(12, 16)}`;
  }

  private mapToGiftCardData(giftCard: {
    id: string;
    code: string;
    balance: { toString(): string } | number;
    initialBalance: { toString(): string } | number;
    recipientPhone: string | null;
    recipientEmail: string | null;
    recipientName: string | null;
    message: string | null;
    expiresAt: Date | null;
    isActive: boolean;
    isRedeemed: boolean;
    redeemedAt: Date | null;
    createdAt: Date;
  }): GiftCardData {
    return {
      id: giftCard.id,
      code: giftCard.code,
      balance: Number(giftCard.balance),
      initialBalance: Number(giftCard.initialBalance),
      recipientPhone: giftCard.recipientPhone ?? undefined,
      recipientEmail: giftCard.recipientEmail ?? undefined,
      recipientName: giftCard.recipientName ?? undefined,
      message: giftCard.message ?? undefined,
      expiresAt: giftCard.expiresAt?.toISOString(),
      isActive: giftCard.isActive,
      isRedeemed: giftCard.isRedeemed,
      redeemedAt: giftCard.redeemedAt?.toISOString(),
      purchasedAt: giftCard.createdAt.toISOString(),
    };
  }

  private mapToGiftCardBalanceData(giftCard: {
    id: string;
    code: string;
    balance: { toString(): string } | number;
    initialBalance: { toString(): string } | number;
    recipientPhone: string | null;
    recipientEmail: string | null;
    recipientName: string | null;
    message: string | null;
    expiresAt: Date | null;
    isActive: boolean;
    isRedeemed: boolean;
    redeemedAt: Date | null;
    createdAt: Date;
    transactions: Array<{
      id: string;
      type: string;
      amount: { toString(): string } | number;
      description: string | null;
      orderId: string | null;
      createdAt: Date;
    }>;
  }): GiftCardBalanceData {
    return {
      ...this.mapToGiftCardData(giftCard),
      transactions: giftCard.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description ?? undefined,
        orderId: t.orderId ?? undefined,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }
}
