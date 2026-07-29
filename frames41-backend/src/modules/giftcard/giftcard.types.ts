/**
 * Gift card types
 */

import type { GiftCard, GiftCardTransaction, User } from '@prisma/client';

export interface GiftCardWithTransactions extends GiftCard {
  transactions: GiftCardTransaction[];
  purchaser: Pick<User, 'id' | 'name' | 'phone'> | null;
}

export interface CreateGiftCardInput {
  balance: number;
  recipientPhone?: string;
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
  expiresAt?: Date;
}

export interface GiftCardData {
  id: string;
  code: string;
  balance: number;
  initialBalance: number;
  recipientPhone?: string;
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
  expiresAt?: string;
  isActive: boolean;
  isRedeemed: boolean;
  redeemedAt?: string;
  purchasedAt: string;
}

export interface GiftCardTransactionData {
  id: string;
  type: string;
  amount: number;
  description?: string;
  orderId?: string;
  createdAt: string;
}

export interface GiftCardBalanceData extends GiftCardData {
  transactions: GiftCardTransactionData[];
}

export interface ValidateGiftCardResult {
  valid: boolean;
  giftCardId?: string;
  balance?: number;
  message?: string;
}

export interface RedeemGiftCardInput {
  code: string;
  userId: string;
}

export interface ApplyGiftCardInput {
  giftCardId: string;
  orderId: string;
  amount: number;
}

export interface IGiftCardRepository {
  findById(id: string): Promise<GiftCardWithTransactions | null>;
  findByCode(code: string): Promise<GiftCardWithTransactions | null>;
  findByPurchaser(userId: string): Promise<GiftCard[]>;
  findByRedeemer(userId: string): Promise<GiftCard[]>;
  create(data: CreateGiftCardInput & { code: string; purchasedBy?: string; initialBalance: number }): Promise<GiftCard>;
  redeem(id: string, userId: string): Promise<GiftCard>;
  deductBalance(id: string, amount: number): Promise<GiftCard>;
  deactivate(id: string): Promise<GiftCard>;
  createTransaction(data: {
    giftCardId: string;
    type: string;
    amount: number;
    description?: string;
    orderId?: string;
  }): Promise<GiftCardTransaction>;
  cleanupExpired(): Promise<number>;
}

export interface IGiftCardService {
  getGiftCard(code: string): Promise<GiftCardData | null>;
  getGiftCardBalance(code: string, userId: string): Promise<GiftCardBalanceData>;
  createGiftCard(userId: string | null, data: CreateGiftCardInput): Promise<GiftCardData>;
  validateGiftCard(code: string): Promise<ValidateGiftCardResult>;
  redeemGiftCard(code: string, userId: string): Promise<GiftCardData>;
  applyGiftCard(giftCardId: string, orderId: string, amount: number): Promise<{ appliedAmount: number; remainingBalance: number }>;
  getMyGiftCards(userId: string): Promise<{ purchased: GiftCardData[]; redeemed: GiftCardData[] }>;
}
