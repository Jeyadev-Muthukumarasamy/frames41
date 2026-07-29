import type { Cart, CartItem, Prisma } from '@prisma/client';

/**
 * Cart item with product details
 */
export interface CartItemWithProduct extends CartItem {
  product: Prisma.ProductGetPayload<{ include: { images: true; priceTiers: true } }>;
  variant?: Prisma.ProductVariantGetPayload<object> | null;
}

/**
 * Cart with items and products
 */
export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
}

/**
 * Cart item data for API response
 */
export interface CartItemData {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: Record<string, unknown>;
  customImageUrl?: string;
}

/**
 * Cart data for API response
 */
export interface CartData {
  id: string;
  userId: string;
  items: CartItemData[];
  subtotal: number;
  itemCount: number;
  updatedAt: string;
}

/**
 * Cart calculation item
 */
export interface CalculationItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tierDiscount?: number;
}

/**
 * Cart calculation result
 */
export interface CartCalculation {
  items: CalculationItem[];
  subtotal: number;
  couponDiscount: number;
  couponCode?: string;
  shippingCharge: number;
  shippingFree: boolean;
  total: number;
  itemCount: number;
}

/**
 * Cart repository interface
 */
export interface ICartRepository {
  /**
   * Find or create cart for user
   */
  findOrCreateCart(userId: string): Promise<CartWithItems>;

  /**
   * Find cart by user ID
   */
  findByUserId(userId: string): Promise<CartWithItems | null>;

  /**
   * Find cart item by ID
   */
  findCartItemById(id: string): Promise<CartItemWithProduct | null>;

  /**
   * Find cart item by product and variant
   */
  findCartItem(
    cartId: string,
    productId: string,
    variantId?: string,
  ): Promise<CartItem | null>;

  /**
   * Add item to cart
   */
  addItem(
    cartId: string,
    data: {
      productId: string;
      variantId?: string;
      quantity: number;
      customization?: Record<string, unknown>;
      customImageUrl?: string;
      unitPrice: number;
      totalPrice: number;
    },
  ): Promise<CartItem>;

  /**
   * Update cart item
   */
  updateItem(
    itemId: string,
    data: {
      quantity?: number;
      customization?: Record<string, unknown>;
      customImageUrl?: string;
      unitPrice?: number;
      totalPrice?: number;
    },
  ): Promise<CartItem>;

  /**
   * Remove item from cart
   */
  removeItem(itemId: string): Promise<void>;

  /**
   * Clear cart
   */
  clearCart(cartId: string): Promise<void>;

  /**
   * Update cart timestamp
   */
  updateTimestamp(cartId: string): Promise<void>;
}

/**
 * Cart service interface
 */
export interface ICartService {
  /**
   * Get cart for user
   */
  getCart(userId: string): Promise<CartData>;

  /**
   * Add item to cart
   */
  addToCart(
    userId: string,
    data: {
      productId: string;
      variantId?: string;
      quantity: number;
      customization?: Record<string, unknown>;
      customImageUrl?: string;
    },
  ): Promise<CartData>;

  /**
   * Update cart item
   */
  updateCartItem(
    userId: string,
    itemId: string,
    data: {
      quantity: number;
      customization?: Record<string, unknown>;
    },
  ): Promise<CartData>;

  /**
   * Remove item from cart
   */
  removeCartItem(userId: string, itemId: string): Promise<CartData>;

  /**
   * Clear cart
   */
  clearCart(userId: string): Promise<void>;

  /**
   * Calculate cart totals
   */
  calculateCart(
    userId: string,
    couponCode?: string,
    pincode?: string,
  ): Promise<CartCalculation>;
}
