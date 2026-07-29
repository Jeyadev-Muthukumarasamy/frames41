/**
 * Referral types
 */

import type { ReferralCode, ReferralRedemption, User } from '@prisma/client';

export interface ReferralCodeWithStats extends ReferralCode {
  redemptionCount: number;
}

export interface ReferralRedemptionWithCode extends ReferralRedemption {
  referralCode: Pick<ReferralCode, 'code' | 'ownerName' | 'discountPercent'>;
}

export interface CreateReferralCodeInput {
  code: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  discountPercent: number;
  commissionPercent: number;
  usageLimit?: number;
}

export interface ReferralCodeData {
  id: string;
  code: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  discountPercent: number;
  commissionPercent: number;
  usageCount: number;
  usageLimit?: number;
  totalDiscountGiven: number;
  totalCommission: number;
  isActive: boolean;
  createdAt: string;
}

export interface ReferralRedemptionData {
  id: string;
  referralCode: string;
  referrerName: string;
  discountPercent: number;
  discountAmount: number;
  commissionAmount: number;
  redeemedAt: string;
}

export interface ValidateReferralResult {
  valid: boolean;
  code?: string;
  discountPercent?: number;
  message?: string;
}

export interface ApplyReferralInput {
  code: string;
  userId: string;
  orderId: string;
  orderTotal: number;
}

export interface IReferralRepository {
  findById(id: string): Promise<ReferralCode | null>;
  findByCode(code: string): Promise<ReferralCode | null>;
  findByOwnerUserId(userId: string): Promise<ReferralCode | null>;
  findAll(options?: { activeOnly?: boolean; limit?: number; offset?: number }): Promise<ReferralCode[]>;
  count(options?: { activeOnly?: boolean }): Promise<number>;
  create(data: CreateReferralCodeInput & { ownerUserId?: string }): Promise<ReferralCode>;
  update(id: string, data: Partial<CreateReferralCodeInput>): Promise<ReferralCode>;
  deactivate(id: string): Promise<ReferralCode>;
  incrementUsage(id: string, discountAmount: number, commissionAmount: number): Promise<void>;
  createRedemption(data: {
    referralCodeId: string;
    userId: string;
    orderId: string;
    discountAmount: number;
    commissionAmount: number;
  }): Promise<ReferralRedemption>;
  findRedemptionByUserAndCode(userId: string, referralCodeId: string): Promise<ReferralRedemption | null>;
  findRedemptionsByCode(referralCodeId: string): Promise<ReferralRedemption[]>;
  findRedemptionsByUser(userId: string): Promise<ReferralRedemptionWithCode[]>;
}

export interface IReferralService {
  getReferralCode(code: string): Promise<ReferralCodeData | null>;
  getUserReferralCode(userId: string): Promise<ReferralCodeData | null>;
  createReferralCode(userId: string | null, data: CreateReferralCodeInput): Promise<ReferralCodeData>;
  updateReferralCode(id: string, data: Partial<CreateReferralCodeInput>): Promise<ReferralCodeData>;
  validateReferralCode(code: string, userId: string): Promise<ValidateReferralResult>;
  applyReferralCode(input: ApplyReferralInput): Promise<{ discountAmount: number; commissionAmount: number }>;
  getReferralStats(code: string): Promise<{ code: ReferralCodeData; redemptions: ReferralRedemptionData[] }>;
  getUserReferralHistory(userId: string): Promise<ReferralRedemptionData[]>;
}
