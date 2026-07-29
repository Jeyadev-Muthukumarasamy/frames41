/**
 * Gift card repository implementation
 */

import type { PrismaClient, GiftCard, GiftCardTransaction, GiftCardTransactionType } from '@prisma/client';
import type { IGiftCardRepository, GiftCardWithTransactions, CreateGiftCardInput } from './giftcard.types.js';

export class GiftCardRepository implements IGiftCardRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<GiftCardWithTransactions | null> {
    const giftCard = await this.prisma.giftCard.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        purchaser: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return giftCard as GiftCardWithTransactions | null;
  }

  async findByCode(code: string): Promise<GiftCardWithTransactions | null> {
    const giftCard = await this.prisma.giftCard.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        purchaser: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return giftCard as GiftCardWithTransactions | null;
  }

  async findByPurchaser(userId: string): Promise<GiftCard[]> {
    return this.prisma.giftCard.findMany({
      where: { purchasedBy: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByRedeemer(userId: string): Promise<GiftCard[]> {
    return this.prisma.giftCard.findMany({
      where: { redeemedBy: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateGiftCardInput & { code: string; purchasedBy?: string; initialBalance: number }): Promise<GiftCard> {
    return this.prisma.giftCard.create({
      data: {
        code: data.code,
        balance: data.balance,
        initialBalance: data.initialBalance,
        purchasedBy: data.purchasedBy,
        recipientPhone: data.recipientPhone,
        recipientEmail: data.recipientEmail,
        recipientName: data.recipientName,
        message: data.message,
        expiresAt: data.expiresAt,
      },
    });
  }

  async redeem(id: string, userId: string): Promise<GiftCard> {
    return this.prisma.giftCard.update({
      where: { id },
      data: {
        isRedeemed: true,
        redeemedBy: userId,
        redeemedAt: new Date(),
      },
    });
  }

  async deductBalance(id: string, amount: number): Promise<GiftCard> {
    return this.prisma.giftCard.update({
      where: { id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });
  }

  async deactivate(id: string): Promise<GiftCard> {
    return this.prisma.giftCard.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async createTransaction(data: {
    giftCardId: string;
    type: string;
    amount: number;
    description?: string;
    orderId?: string;
  }): Promise<GiftCardTransaction> {
    return this.prisma.giftCardTransaction.create({
      data: {
        giftCardId: data.giftCardId,
        type: data.type as GiftCardTransactionType,
        amount: data.amount,
        description: data.description,
        orderId: data.orderId,
      },
    });
  }

  async cleanupExpired(): Promise<number> {
    const now = new Date();
    
    const result = await this.prisma.giftCard.updateMany({
      where: {
        expiresAt: {
          lt: now,
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return result.count;
  }
}
