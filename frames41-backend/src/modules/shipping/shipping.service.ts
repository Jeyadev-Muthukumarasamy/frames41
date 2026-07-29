import type { PincodeServiceability, ShippingRate } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { SHIPPING } from '../../config/constants.js';

const TEMP_FREE_SHIPPING_FOR_RAZORPAY_TEST = process.env.FREE_SHIPPING_FOR_RAZORPAY_TEST !== 'false';

/**
 * Serviceability check result
 */
export interface ServiceabilityResult {
  serviceable: boolean;
  pincode: string;
  estimatedDays?: number;
  courierPartner?: string;
  state?: string;
}

/**
 * Shipping calculation result
 */
export interface ShippingCalculationResult {
  charge: number;
  free: boolean;
  threshold: number;
  estimatedDays?: number;
  message?: string;
}

/**
 * Shipping service
 */
export class ShippingService {
  /**
   * Check pincode serviceability
   */
  async checkServiceability(pincode: string): Promise<ServiceabilityResult> {
    const serviceability = await prisma.pincodeServiceability.findUnique({
      where: { pincode },
    });

    if (!serviceability) {
      // If not in database, assume serviceable (for Phase 3)
      return {
        serviceable: true,
        pincode,
        estimatedDays: 5,
        state: 'Unknown',
      };
    }

    return {
      serviceable: serviceability.isServiceable,
      pincode,
      estimatedDays: serviceability.estimatedDays,
      courierPartner: serviceability.courierPartner ?? undefined,
      state: 'Unknown', // Could be extended with pincode-state mapping
    };
  }

  /**
   * Calculate shipping charge
   */
  async calculateShipping(
    subtotal: number,
    state?: string,
    pincode?: string,
  ): Promise<ShippingCalculationResult> {
    if (TEMP_FREE_SHIPPING_FOR_RAZORPAY_TEST) {
      // Temporary: free shipping for Razorpay testing. Remove after payment flow is verified.
      return {
        charge: 0,
        free: true,
        threshold: SHIPPING.FREE_SHIPPING_THRESHOLD,
      };
    }

    // Check free shipping threshold
    if (subtotal >= SHIPPING.FREE_SHIPPING_THRESHOLD) {
      return {
        charge: 0,
        free: true,
        threshold: SHIPPING.FREE_SHIPPING_THRESHOLD,
      };
    }

    // Check pincode serviceability
    if (pincode) {
      const serviceability = await this.checkServiceability(pincode);
      if (!serviceability.serviceable) {
        return {
          charge: 0,
          free: false,
          threshold: SHIPPING.FREE_SHIPPING_THRESHOLD,
          message: 'Delivery not available for this pincode',
        };
      }

      return {
        charge: SHIPPING.DEFAULT_SHIPPING_CHARGE,
        free: false,
        threshold: SHIPPING.FREE_SHIPPING_THRESHOLD,
        estimatedDays: serviceability.estimatedDays,
      };
    }

    // Default shipping charge
    return {
      charge: SHIPPING.DEFAULT_SHIPPING_CHARGE,
      free: false,
      threshold: SHIPPING.FREE_SHIPPING_THRESHOLD,
    };
  }

  /**
   * Get shipping rate for state
   */
  async getShippingRate(
    state: string,
    orderValue: number,
    categoryId?: string,
  ): Promise<ShippingRate | null> {
    const rate = await prisma.shippingRate.findFirst({
      where: {
        state,
        isActive: true,
        minOrderValue: { lte: orderValue },
        OR: [
          { productCategoryId: categoryId },
          { productCategoryId: null },
        ],
      },
      orderBy: { minOrderValue: 'desc' },
    });

    return rate;
  }

  /**
   * Create or update pincode serviceability
   */
  async upsertPincodeServiceability(data: {
    pincode: string;
    isServiceable: boolean;
    estimatedDays: number;
    courierPartner?: string;
  }): Promise<PincodeServiceability> {
    return prisma.pincodeServiceability.upsert({
      where: { pincode: data.pincode },
      update: {
        isServiceable: data.isServiceable,
        estimatedDays: data.estimatedDays,
        courierPartner: data.courierPartner,
      },
      create: {
        pincode: data.pincode,
        isServiceable: data.isServiceable,
        estimatedDays: data.estimatedDays,
        courierPartner: data.courierPartner,
      },
    });
  }

  /**
   * Create shipping rate
   */
  async createShippingRate(data: {
    state: string;
    minOrderValue: number;
    shippingCharge: number;
    productCategoryId?: string;
    isActive?: boolean;
  }): Promise<ShippingRate> {
    return prisma.shippingRate.create({
      data: {
        state: data.state,
        minOrderValue: data.minOrderValue,
        shippingCharge: data.shippingCharge,
        productCategoryId: data.productCategoryId,
        isActive: data.isActive ?? true,
      },
    });
  }
}
