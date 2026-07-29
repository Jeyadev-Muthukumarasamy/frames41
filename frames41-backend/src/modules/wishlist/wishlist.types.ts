/**
 * Wishlist types
 */

import type { Wishlist, Product, ProductImage } from '@prisma/client';

export interface WishlistWithProduct extends Wishlist {
  product: Product & {
    images: ProductImage[];
    category: { name: string; slug: string };
  };
}

export interface WishlistItemData {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  categoryName: string;
  basePrice: number;
  discountedPrice?: number;
  stock: number;
  isActive: boolean;
  addedAt: string;
}

export interface WishlistData {
  userId: string;
  items: WishlistItemData[];
  itemCount: number;
}

export interface IWishlistRepository {
  findByUserId(userId: string): Promise<WishlistWithProduct[]>;
  findByUserAndProduct(userId: string, productId: string): Promise<Wishlist | null>;
  create(userId: string, productId: string): Promise<Wishlist>;
  delete(id: string): Promise<void>;
  deleteByUserAndProduct(userId: string, productId: string): Promise<void>;
  clearByUserId(userId: string): Promise<void>;
}

export interface IWishlistService {
  getWishlist(userId: string): Promise<WishlistData>;
  addToWishlist(userId: string, productId: string): Promise<WishlistData>;
  removeFromWishlist(userId: string, productId: string): Promise<WishlistData>;
  toggleWishlistItem(userId: string, productId: string): Promise<{ added: boolean; wishlist: WishlistData }>;
  clearWishlist(userId: string): Promise<void>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;
}
