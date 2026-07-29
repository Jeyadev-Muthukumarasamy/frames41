import type { Coupon, CouponType, Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { PricingEngine } from '../cart/pricing.engine.js';
import { ConflictError, NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  type: string;
  value: number;
  discount: number;
  couponId?: string;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  message?: string;
}

type CouponDatabase = PrismaClient | Prisma.TransactionClient;

export class CouponService {
  async validateCoupon(
    code: string,
    userId: string,
    orderValue: number,
    database: CouponDatabase = prisma,
  ): Promise<CouponValidationResult> {
    const normalizedCode = code.trim().toUpperCase();
    const coupon = await database.coupon.findUnique({
      where: { code: normalizedCode },
      include: {
        redemptions: { where: { userId } },
        _count: { select: { redemptions: true } },
      },
    });

    const invalid = (
      message: string,
      current?: typeof coupon,
    ): CouponValidationResult => ({
      valid: false,
      code: current?.code ?? normalizedCode,
      type: current?.type ?? '',
      value: current ? Number(current.value) : 0,
      discount: 0,
      message,
    });

    if (!coupon) return invalid('Invalid coupon code');
    if (!coupon.isActive) return invalid('Coupon is not active', coupon);

    const now = new Date();
    if (now < coupon.validFrom) return invalid('Coupon is not yet valid', coupon);
    if (now > coupon.validTo) return invalid('Coupon has expired', coupon);
    if (coupon.usageLimit !== null && coupon._count.redemptions >= coupon.usageLimit) {
      return invalid('Coupon usage limit exceeded', coupon);
    }
    if (coupon.perUserLimit !== null && coupon.redemptions.length >= coupon.perUserLimit) {
      return invalid('You have reached the usage limit for this coupon', coupon);
    }

    if (coupon.type === 'FIRST_ORDER') {
      const previousOrder = await database.order.findFirst({
        where: { userId, status: { not: 'CANCELLED' } },
        select: { id: true },
      });
      if (previousOrder) {
        return invalid('This coupon is only valid on your first order', coupon);
      }
    }

    if (coupon.minOrderValue !== null && orderValue < Number(coupon.minOrderValue)) {
      return {
        ...invalid(`Minimum order value of ₹${Number(coupon.minOrderValue)} required`, coupon),
        minOrderValue: Number(coupon.minOrderValue),
      };
    }

    const value = Number(coupon.value);
    const minOrderValue = coupon.minOrderValue === null ? null : Number(coupon.minOrderValue);
    const maxDiscount = coupon.maxDiscount === null ? null : Number(coupon.maxDiscount);
    const result = PricingEngine.calculateCouponDiscount(
      { type: coupon.type, value, minOrderValue, maxDiscount },
      orderValue,
    );

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value,
      discount: result.discount,
      minOrderValue,
      maxDiscount,
    };
  }

  async createCoupon(data: {
    code: string;
    type: string;
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    validFrom: string;
    validTo: string;
    isActive?: boolean;
  }): Promise<Coupon> {
    return prisma.coupon.create({
      data: {
        code: data.code.trim().toUpperCase(),
        type: data.type as CouponType,
        value: data.value,
        minOrderValue: data.minOrderValue,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit,
        validFrom: new Date(data.validFrom),
        validTo: new Date(data.validTo),
        isActive: data.isActive ?? true,
      },
    });
  }

  async getCoupons(): Promise<Coupon[]> {
    return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getCouponsForAdmin() {
    const coupons = await prisma.coupon.findMany({
      include: { _count: { select: { redemptions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return coupons.map(({ _count, ...coupon }) => ({
      ...coupon,
      value: Number(coupon.value),
      minOrderValue: coupon.minOrderValue === null ? null : Number(coupon.minOrderValue),
      maxDiscount: coupon.maxDiscount === null ? null : Number(coupon.maxDiscount),
      redemptionCount: _count.redemptions,
    }));
  }

  async createCouponForAdmin(data: {
    code: string;
    type: CouponType;
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    validFrom: string;
    validTo: string;
    isActive: boolean;
  }) {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictError('A coupon with this code already exists');
    this.validateConfiguration(data.type, data.value, data.validFrom, data.validTo);
    return this.createCoupon(data);
  }

  async updateCouponForAdmin(
    id: string,
    data: {
      code?: string;
      type?: CouponType;
      value?: number;
      minOrderValue?: number | null;
      maxDiscount?: number | null;
      usageLimit?: number | null;
      perUserLimit?: number | null;
      validFrom?: string;
      validTo?: string;
      isActive?: boolean;
    },
  ) {
    const current = await prisma.coupon.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Coupon');

    const type = data.type ?? current.type;
    const value = data.value ?? Number(current.value);
    const validFrom = data.validFrom ?? current.validFrom.toISOString();
    const validTo = data.validTo ?? current.validTo.toISOString();
    this.validateConfiguration(type, value, validFrom, validTo);

    if (data.code && data.code !== current.code) {
      const duplicate = await prisma.coupon.findUnique({ where: { code: data.code } });
      if (duplicate) throw new ConflictError('A coupon with this code already exists');
    }

    return prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        ...(data.type !== undefined && data.type !== 'PERCENT' ? { maxDiscount: null } : {}),
        ...(data.validFrom ? { validFrom: new Date(data.validFrom) } : {}),
        ...(data.validTo ? { validTo: new Date(data.validTo) } : {}),
      },
    });
  }

  async archiveCoupon(id: string): Promise<void> {
    const result = await prisma.coupon.updateMany({
      where: { id },
      data: { isActive: false },
    });
    if (result.count === 0) throw new NotFoundError('Coupon');
  }

  private validateConfiguration(
    type: CouponType,
    value: number,
    validFrom: string,
    validTo: string,
  ): void {
    if (type === 'PERCENT' && value > 100) {
      throw new BadRequestError('Percentage cannot exceed 100');
    }
    if (new Date(validTo) <= new Date(validFrom)) {
      throw new BadRequestError('End date must be after start date');
    }
  }
}
