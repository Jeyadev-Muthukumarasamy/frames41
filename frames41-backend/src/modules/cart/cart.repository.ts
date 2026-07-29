import type { Cart, CartItem, Prisma, PrismaClient } from '@prisma/client';
import type { ICartRepository, CartWithItems, CartItemWithProduct } from './cart.types.js';

/**
 * Cart repository implementation
 */
export class CartRepository implements ICartRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private get includeRelations() {
    return {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
              priceTiers: true,
            },
          },
          variant: true,
        },
        orderBy: { createdAt: 'desc' as const },
      },
    };
  }

  async findOrCreateCart(userId: string): Promise<CartWithItems> {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: this.includeRelations,
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: this.includeRelations,
      });
    }

    return cart as CartWithItems;
  }

  async findByUserId(userId: string): Promise<CartWithItems | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: this.includeRelations,
    });

    return cart as CartWithItems | null;
  }

  async findCartItemById(id: string): Promise<CartItemWithProduct | null> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        variant: true,
      },
    });

    return item as CartItemWithProduct | null;
  }

  async findCartItem(
    cartId: string,
    productId: string,
    variantId?: string,
  ): Promise<CartItem | null> {
    return this.prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
        variantId: variantId || null,
      },
    });
  }

  async addItem(
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
  ): Promise<CartItem> {
    return this.prisma.cartItem.create({
      data: {
        cartId,
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        customization: data.customization as Prisma.InputJsonObject | undefined,
        customImageUrl: data.customImageUrl,
        unitPrice: data.unitPrice,
        totalPrice: data.totalPrice,
      },
    });
  }

  async updateItem(
    itemId: string,
    data: {
      quantity?: number;
      customization?: Record<string, unknown>;
      customImageUrl?: string;
      unitPrice?: number;
      totalPrice?: number;
    },
  ): Promise<CartItem> {
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: data as Prisma.CartItemUncheckedUpdateInput,
    });
  }

  async removeItem(itemId: string): Promise<void> {
    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async updateTimestamp(cartId: string): Promise<void> {
    await this.prisma.cart.update({
      where: { id: cartId },
      data: { updatedAt: new Date() },
    });
  }
}
