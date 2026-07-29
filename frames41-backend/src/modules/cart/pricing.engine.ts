import type { ProductPriceTier } from '@prisma/client';
import { SHIPPING } from '../../config/constants.js';

const TEMP_FREE_SHIPPING_FOR_RAZORPAY_TEST = process.env.FREE_SHIPPING_FOR_RAZORPAY_TEST !== 'false';

/**
 * Cart item for pricing calculation
 */
interface PricingItem {
  productId: string;
  productName: string;
  quantity: number;
  basePrice: number;
  priceTiers: ProductPriceTier[];
}

/**
 * Calculated item result
 */
interface CalculatedItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tierDiscount: number;
}

/**
 * Coupon validation result
 */
interface CouponValidation {
  valid: boolean;
  discount: number;
  message?: string;
}

/**
 * Shipping calculation result
 */
interface ShippingCalculation {
  charge: number;
  free: boolean;
  estimatedDays?: number;
}

/**
 * Pricing engine service
 * Handles all price calculations for cart
 */
export class PricingEngine {
  /**
   * Calculate unit price with price tier discounts
   */
  static calculateUnitPrice(
    basePrice: number,
    quantity: number,
    priceTiers: ProductPriceTier[],
  ): { unitPrice: number; tierDiscount: number } {
    // Sort tiers by minQty descending to find best discount
    const sortedTiers = [...priceTiers].sort((a, b) => b.minQty - a.minQty);

    // Find applicable tier
    const applicableTier = sortedTiers.find((tier) => quantity >= tier.minQty);

    if (applicableTier) {
      const discount = basePrice - Number(applicableTier.pricePerUnit);
      return {
        unitPrice: Number(applicableTier.pricePerUnit),
        tierDiscount: discount,
      };
    }

    return {
      unitPrice: basePrice,
      tierDiscount: 0,
    };
  }

  /**
   * Calculate cart items with price tiers
   */
  static calculateItems(items: PricingItem[]): CalculatedItem[] {
    return items.map((item) => {
      const { unitPrice, tierDiscount } = this.calculateUnitPrice(
        item.basePrice,
        item.quantity,
        item.priceTiers,
      );

      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
        tierDiscount,
      };
    });
  }

  /**
   * Calculate subtotal from items
   */
  static calculateSubtotal(items: CalculatedItem[]): number {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  /**
   * Validate and calculate coupon discount
   */
  static calculateCouponDiscount(
    coupon: {
      type: string;
      value: number;
      minOrderValue?: number | null;
      maxDiscount?: number | null;
    } | null,
    subtotal: number,
  ): CouponValidation {
    if (!coupon) {
      return { valid: false, discount: 0 };
    }

    // Check minimum order value
    if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of ₹${coupon.minOrderValue} required`,
      };
    }

    let discount = 0;

    switch (coupon.type) {
      case 'PERCENT':
        discount = (subtotal * coupon.value) / 100;
        break;
      case 'FLAT':
      case 'FIRST_ORDER':
        discount = coupon.value;
        break;
      default:
        return { valid: false, discount: 0, message: 'Invalid coupon type' };
    }

    // Apply max discount limit
    if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
      discount = Number(coupon.maxDiscount);
    }

    // Ensure discount doesn't exceed subtotal
    if (discount > subtotal) {
      discount = subtotal;
    }

    return { valid: true, discount: Number(discount.toFixed(2)) };
  }

  /**
   * Calculate shipping charge
   */
  static calculateShipping(
    subtotal: number,
    state?: string,
    pincodeServiceable?: boolean,
  ): ShippingCalculation {
    if (TEMP_FREE_SHIPPING_FOR_RAZORPAY_TEST) {
      // Temporary: free shipping for Razorpay testing. Remove after payment flow is verified.
      return {
        charge: 0,
        free: true,
      };
    }

    // Check if shipping is free
    if (subtotal >= SHIPPING.FREE_SHIPPING_THRESHOLD) {
      return {
        charge: 0,
        free: true,
      };
    }

    // Check if pincode is serviceable
    if (pincodeServiceable === false) {
      return {
        charge: 0,
        free: false,
      };
    }

    return {
      charge: SHIPPING.DEFAULT_SHIPPING_CHARGE,
      free: false,
    };
  }

  /**
   * Calculate final total
   */
  static calculateTotal(
    subtotal: number,
    couponDiscount: number,
    shippingCharge: number,
  ): number {
    return Math.max(0, subtotal - couponDiscount + shippingCharge);
  }

  /**
   * Full cart calculation
   */
  static calculateCart(
    items: PricingItem[],
    coupon: {
      code: string;
      type: string;
      value: number;
      minOrderValue?: number | null;
      maxDiscount?: number | null;
    } | null,
    state?: string,
    pincodeServiceable?: boolean,
  ): {
    items: CalculatedItem[];
    subtotal: number;
    couponDiscount: number;
    couponCode?: string;
    shippingCharge: number;
    shippingFree: boolean;
    total: number;
    itemCount: number;
  } {
    // Calculate items with price tiers
    const calculatedItems = this.calculateItems(items);

    // Calculate subtotal
    const subtotal = this.calculateSubtotal(calculatedItems);

    // Calculate coupon discount
    const couponValidation = coupon
      ? this.calculateCouponDiscount(coupon, subtotal)
      : { valid: false, discount: 0 };

    // Calculate shipping
    const shipping = this.calculateShipping(subtotal, state, pincodeServiceable);

    // Calculate total
    const total = this.calculateTotal(
      subtotal,
      couponValidation.discount,
      shipping.charge,
    );

    // Calculate total item count
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: calculatedItems,
      subtotal,
      couponDiscount: couponValidation.discount,
      couponCode: coupon && couponValidation.valid ? coupon.code : undefined,
      shippingCharge: shipping.charge,
      shippingFree: shipping.free,
      total,
      itemCount,
    };
  }
}
