/**
 * Wishlist repository implementation
 */

import type { PrismaClient, Wishlist } from '@prisma/client';
import type { IWishlistRepository, WishlistWithProduct } from './wishlist.types.js';

export class WishlistRepository implements IWishlistRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByUserId(userId: string): Promise<WishlistWithProduct[]> {
    const items = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    return items as WishlistWithProduct[];
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<Wishlist | null> {
    return this.prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async create(userId: string, productId: string): Promise<Wishlist> {
    return this.prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.wishlist.delete({
      where: { id },
    });
  }

  async deleteByUserAndProduct(userId: string, productId: string): Promise<void> {
    await this.prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async clearByUserId(userId: string): Promise<void> {
    await this.prisma.wishlist.deleteMany({
      where: { userId },
    });
  }
}
