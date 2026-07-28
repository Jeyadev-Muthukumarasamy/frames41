/**
 * Abandoned cart trigger types
 */

import type { AbandonedCartTrigger, Product, User, Coupon } from '@prisma/client';

export interface AbandonedCartTriggerWithRelations extends AbandonedCartTrigger {
  user: Pick<User, 'id' | 'phone' | 'name'>;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'basePrice'> & {
    images: Array<{ url: string }>;
  };
  coupon?: Coupon | null;
}

export interface TrackViewInput {
  userId: string;
  productId: string;
}

export interface TrackExitInput {
  userId: string;
  productId: string;
}

export interface AbandonedCartData {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  lastViewedAt: string;
  exitedAt?: string;
  couponSent: boolean;
  couponCode?: string;
  couponSentAt?: string;
}

export interface PendingAbandonedCart {
  id: string;
  userId: string;
  userPhone: string;
  userName?: string;
  productId: string;
  productName: string;
  productSlug: string;
  exitedAt: Date;
}

export interface IAbandonedCartTriggerRepository {
  findByUserAndProduct(userId: string, productId: string): Promise<AbandonedCartTrigger | null>;
  findPendingForCoupon(minutesSinceExit: number): Promise<AbandonedCartTriggerWithRelations[]>;
  trackView(userId: string, productId: string): Promise<AbandonedCartTrigger>;
  trackExit(userId: string, productId: string): Promise<void>;
  markCouponSent(id: string, couponId: string): Promise<void>;
  markConverted(userId: string, productId: string): Promise<void>;
  delete(id: string): Promise<void>;
  cleanupOldTriggers(days: number): Promise<number>;
}

export interface IAbandonedCartTriggerService {
  trackProductView(userId: string, productId: string): Promise<void>;
  trackProductExit(userId: string, productId: string): Promise<void>;
  processAbandonedCarts(): Promise<{ processed: number; couponsSent: number }>;
}
