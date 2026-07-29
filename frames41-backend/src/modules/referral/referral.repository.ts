/**
 * Referral repository implementation
 */

import type { PrismaClient, ReferralCode, ReferralRedemption } from '@prisma/client';
import type { IReferralRepository, ReferralRedemptionWithCode, CreateReferralCodeInput } from './referral.types.js';

export class ReferralRepository implements IReferralRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<ReferralCode | null> {
    return this.prisma.referralCode.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<ReferralCode | null> {
    return this.prisma.referralCode.findUnique({
      where: { code },
    });
  }

  async findByOwnerUserId(userId: string): Promise<ReferralCode | null> {
    return this.prisma.referralCode.findFirst({
      where: { ownerUserId: userId },
    });
  }

  async findAll(options?: { activeOnly?: boolean; limit?: number; offset?: number }): Promise<ReferralCode[]> {
    return this.prisma.referralCode.findMany({
      where: {
        ...(options?.activeOnly && { isActive: true }),
      },
      skip: options?.offset,
      take: options?.limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(options?: { activeOnly?: boolean }): Promise<number> {
    return this.prisma.referralCode.count({
      where: {
        ...(options?.activeOnly && { isActive: true }),
      },
    });
  }

  async create(data: CreateReferralCodeInput & { ownerUserId?: string }): Promise<ReferralCode> {
    return this.prisma.referralCode.create({
      data: {
        code: data.code.toUpperCase(),
        ownerUserId: data.ownerUserId,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        ownerEmail: data.ownerEmail,
        discountPercent: data.discountPercent,
        commissionPercent: data.commissionPercent,
        usageLimit: data.usageLimit,
      },
    });
  }

  async update(id: string, data: Partial<CreateReferralCodeInput>): Promise<ReferralCode> {
    return this.prisma.referralCode.update({
      where: { id },
      data: {
        ...(data.ownerName && { ownerName: data.ownerName }),
        ...(data.ownerPhone !== undefined && { ownerPhone: data.ownerPhone }),
        ...(data.ownerEmail !== undefined && { ownerEmail: data.ownerEmail }),
        ...(data.discountPercent && { discountPercent: data.discountPercent }),
        ...(data.commissionPercent && { commissionPercent: data.commissionPercent }),
        ...(data.usageLimit && { usageLimit: data.usageLimit }),
      },
    });
  }

  async deactivate(id: string): Promise<ReferralCode> {
    return this.prisma.referralCode.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async incrementUsage(id: string, discountAmount: number, commissionAmount: number): Promise<void> {
    await this.prisma.referralCode.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
        totalDiscountGiven: {
          increment: discountAmount,
        },
        totalCommission: {
          increment: commissionAmount,
        },
      },
    });
  }

  async createRedemption(data: {
    referralCodeId: string;
    userId: string;
    orderId: string;
    discountAmount: number;
    commissionAmount: number;
  }): Promise<ReferralRedemption> {
    return this.prisma.referralRedemption.create({
      data: {
        referralCodeId: data.referralCodeId,
        userId: data.userId,
        orderId: data.orderId,
        discountAmount: data.discountAmount,
        commissionAmount: data.commissionAmount,
      },
    });
  }

  async findRedemptionByUserAndCode(userId: string, referralCodeId: string): Promise<ReferralRedemption | null> {
    return this.prisma.referralRedemption.findFirst({
      where: {
        userId,
        referralCodeId,
      },
    });
  }

  async findRedemptionsByCode(referralCodeId: string): Promise<ReferralRedemption[]> {
    return this.prisma.referralRedemption.findMany({
      where: { referralCodeId },
      orderBy: { redeemedAt: 'desc' },
    });
  }

  async findRedemptionsByUser(userId: string): Promise<ReferralRedemptionWithCode[]> {
    const redemptions = await this.prisma.referralRedemption.findMany({
      where: { userId },
      include: {
        referralCode: {
          select: {
            code: true,
            ownerName: true,
            discountPercent: true,
          },
        },
      },
      orderBy: { redeemedAt: 'desc' },
    });

    return redemptions as ReferralRedemptionWithCode[];
  }
}
