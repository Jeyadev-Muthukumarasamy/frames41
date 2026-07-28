/**
 * Wishlist service implementation
 */

import type { IWishlistService, IWishlistRepository, WishlistData, WishlistWithProduct } from './wishlist.types.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export class WishlistService implements IWishlistService {
  private readonly repository: IWishlistRepository;

  constructor(repository: IWishlistRepository) {
    this.repository = repository;
  }

  async getWishlist(userId: string): Promise<WishlistData> {
    const items = await this.repository.findByUserId(userId);
    return this.mapToWishlistData(userId, items);
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistData> {
    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    if (!product.isActive) {
      throw new BadRequestError('Product is not available');
    }

    // Check if already in wishlist
    const existing = await this.repository.findByUserAndProduct(userId, productId);
    if (existing) {
      throw new ConflictError('Product is already in wishlist');
    }

    // Add to wishlist
    await this.repository.create(userId, productId);

    logger.info({ userId, productId }, 'Product added to wishlist');

    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<WishlistData> {
    // Check if item exists in wishlist
    const existing = await this.repository.findByUserAndProduct(userId, productId);
    if (!existing) {
      throw new NotFoundError('Wishlist item');
    }

    await this.repository.deleteByUserAndProduct(userId, productId);

    logger.info({ userId, productId }, 'Product removed from wishlist');

    return this.getWishlist(userId);
  }

  async toggleWishlistItem(userId: string, productId: string): Promise<{ added: boolean; wishlist: WishlistData }> {
    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    if (!product.isActive) {
      throw new BadRequestError('Product is not available');
    }

    // Check if already in wishlist
    const existing = await this.repository.findByUserAndProduct(userId, productId);

    if (existing) {
      // Remove from wishlist
      await this.repository.deleteByUserAndProduct(userId, productId);
      logger.info({ userId, productId }, 'Product removed from wishlist (toggle)');
      return {
        added: false,
        wishlist: await this.getWishlist(userId),
      };
    } else {
      // Add to wishlist
      await this.repository.create(userId, productId);
      logger.info({ userId, productId }, 'Product added to wishlist (toggle)');
      return {
        added: true,
        wishlist: await this.getWishlist(userId),
      };
    }
  }

  async clearWishlist(userId: string): Promise<void> {
    await this.repository.clearByUserId(userId);
    logger.info({ userId }, 'Wishlist cleared');
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const existing = await this.repository.findByUserAndProduct(userId, productId);
    return !!existing;
  }

  private mapToWishlistData(userId: string, items: WishlistWithProduct[]): WishlistData {
    const mappedItems = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: item.product.images[0]?.url,
      categoryName: item.product.category.name,
      basePrice: Number(item.product.basePrice),
      discountedPrice: item.product.discountedPrice ? Number(item.product.discountedPrice) : undefined,
      stock: item.product.stock,
      isActive: item.product.isActive,
      addedAt: item.addedAt.toISOString(),
    }));

    return {
      userId,
      items: mappedItems,
      itemCount: mappedItems.length,
    };
  }
}
