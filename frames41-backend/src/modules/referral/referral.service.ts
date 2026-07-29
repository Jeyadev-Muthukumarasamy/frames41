/**
 * Referral service implementation
 */

import type {
  IReferralService,
  IReferralRepository,
  ReferralCodeData,
  ReferralRedemptionData,
  CreateReferralCodeInput,
  ValidateReferralResult,
  ApplyReferralInput,
} from './referral.types.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export class ReferralService implements IReferralService {
  private readonly repository: IReferralRepository;

  constructor(repository: IReferralRepository) {
    this.repository = repository;
  }

  async getReferralCode(code: string): Promise<ReferralCodeData | null> {
    const referralCode = await this.repository.findByCode(code);
    if (!referralCode) return null;

    return this.mapToReferralCodeData(referralCode);
  }

  async getUserReferralCode(userId: string): Promise<ReferralCodeData | null> {
    const referralCode = await this.repository.findByOwnerUserId(userId);
    if (!referralCode) return null;

    return this.mapToReferralCodeData(referralCode);
  }

  async createReferralCode(userId: string | null, data: CreateReferralCodeInput): Promise<ReferralCodeData> {
    // Check if code already exists
    const existing = await this.repository.findByCode(data.code);
    if (existing) {
      throw new ConflictError('Referral code already exists');
    }

    // If userId provided, check if user already has a referral code
    if (userId) {
      const existingForUser = await this.repository.findByOwnerUserId(userId);
      if (existingForUser) {
        throw new ConflictError('User already has a referral code');
      }
    }

    const referralCode = await this.repository.create({
      ...data,
      ownerUserId: userId || undefined,
    });

    logger.info({ code: data.code, userId }, 'Referral code created');

    return this.mapToReferralCodeData(referralCode);
  }

  async updateReferralCode(id: string, data: Partial<CreateReferralCodeInput>): Promise<ReferralCodeData> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Referral code');
    }

    const updated = await this.repository.update(id, data);

    logger.info({ id }, 'Referral code updated');

    return this.mapToReferralCodeData(updated);
  }

  async validateReferralCode(code: string, userId: string): Promise<ValidateReferralResult> {
    const referralCode = await this.repository.findByCode(code);

    if (!referralCode) {
      return { valid: false, message: 'Invalid referral code' };
    }

    if (!referralCode.isActive) {
      return { valid: false, message: 'Referral code is no longer active' };
    }

    if (referralCode.usageLimit && referralCode.usageCount >= referralCode.usageLimit) {
      return { valid: false, message: 'Referral code usage limit reached' };
    }

    // Check if user has already used this code
    const existingRedemption = await this.repository.findRedemptionByUserAndCode(userId, referralCode.id);
    if (existingRedemption) {
      return { valid: false, message: 'You have already used this referral code' };
    }

    // Prevent self-referral
    if (referralCode.ownerUserId === userId) {
      return { valid: false, message: 'You cannot use your own referral code' };
    }

    return {
      valid: true,
      code: referralCode.code,
      discountPercent: Number(referralCode.discountPercent),
    };
  }

  async applyReferralCode(input: ApplyReferralInput): Promise<{ discountAmount: number; commissionAmount: number }> {
    const referralCode = await this.repository.findByCode(input.code);

    if (!referralCode) {
      throw new NotFoundError('Referral code');
    }

    if (!referralCode.isActive) {
      throw new BadRequestError('Referral code is no longer active');
    }

    if (referralCode.usageLimit && referralCode.usageCount >= referralCode.usageLimit) {
      throw new BadRequestError('Referral code usage limit reached');
    }

    // Check if user has already used this code
    const existingRedemption = await this.repository.findRedemptionByUserAndCode(input.userId, referralCode.id);
    if (existingRedemption) {
      throw new BadRequestError('You have already used this referral code');
    }

    // Prevent self-referral
    if (referralCode.ownerUserId === input.userId) {
      throw new BadRequestError('You cannot use your own referral code');
    }

    // Calculate discount and commission
    const discountPercent = Number(referralCode.discountPercent);
    const commissionPercent = Number(referralCode.commissionPercent);
    const discountAmount = Number((input.orderTotal * (discountPercent / 100)).toFixed(2));
    const commissionAmount = Number((input.orderTotal * (commissionPercent / 100)).toFixed(2));

    // Create redemption record
    await this.repository.createRedemption({
      referralCodeId: referralCode.id,
      userId: input.userId,
      orderId: input.orderId,
      discountAmount,
      commissionAmount,
    });

    // Update referral code stats
    await this.repository.incrementUsage(referralCode.id, discountAmount, commissionAmount);

    logger.info({
      code: input.code,
      userId: input.userId,
      orderId: input.orderId,
      discountAmount,
      commissionAmount,
    }, 'Referral code applied');

    return { discountAmount, commissionAmount };
  }

  async getReferralStats(code: string): Promise<{ code: ReferralCodeData; redemptions: ReferralRedemptionData[] }> {
    const referralCode = await this.repository.findByCode(code);
    if (!referralCode) {
      throw new NotFoundError('Referral code');
    }

    const redemptions = await this.repository.findRedemptionsByCode(referralCode.id);

    return {
      code: this.mapToReferralCodeData(referralCode),
      redemptions: redemptions.map((r) => ({
        id: r.id,
        referralCode: code,
        referrerName: referralCode.ownerName,
        discountPercent: Number(referralCode.discountPercent),
        discountAmount: Number(r.discountAmount),
        commissionAmount: Number(r.commissionAmount),
        redeemedAt: r.redeemedAt.toISOString(),
      })),
    };
  }

  async getUserReferralHistory(userId: string): Promise<ReferralRedemptionData[]> {
    const redemptions = await this.repository.findRedemptionsByUser(userId);

    return redemptions.map((r) => ({
      id: r.id,
      referralCode: r.referralCode.code,
      referrerName: r.referralCode.ownerName,
      discountPercent: Number(r.referralCode.discountPercent),
      discountAmount: Number(r.discountAmount),
      commissionAmount: Number(r.commissionAmount),
      redeemedAt: r.redeemedAt.toISOString(),
    }));
  }

  private mapToReferralCodeData(referralCode: {
    id: string;
    code: string;
    ownerName: string;
    ownerPhone: string | null;
    ownerEmail: string | null;
    discountPercent: { toString(): string } | number;
    commissionPercent: { toString(): string } | number;
    usageCount: number;
    usageLimit: number | null;
    totalDiscountGiven: { toString(): string } | number;
    totalCommission: { toString(): string } | number;
    isActive: boolean;
    createdAt: Date;
  }): ReferralCodeData {
    return {
      id: referralCode.id,
      code: referralCode.code,
      ownerName: referralCode.ownerName,
      ownerPhone: referralCode.ownerPhone ?? undefined,
      ownerEmail: referralCode.ownerEmail ?? undefined,
      discountPercent: Number(referralCode.discountPercent),
      commissionPercent: Number(referralCode.commissionPercent),
      usageCount: referralCode.usageCount,
      usageLimit: referralCode.usageLimit ?? undefined,
      totalDiscountGiven: Number(referralCode.totalDiscountGiven),
      totalCommission: Number(referralCode.totalCommission),
      isActive: referralCode.isActive,
      createdAt: referralCode.createdAt.toISOString(),
    };
  }
}
