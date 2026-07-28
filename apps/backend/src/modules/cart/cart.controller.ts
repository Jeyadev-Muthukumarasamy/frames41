import type { Request, Response, NextFunction } from 'express';
import type { ICartService } from './cart.types.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemIdParamSchema,
  calculateCartSchema,
} from './cart.schema.js';

/**
 * Cart controller
 */
export class CartController {
  private readonly cartService: ICartService;

  constructor(cartService: ICartService) {
    this.cartService = cartService;
  }

  /**
   * GET /cart
   * Get user's cart
   */
  getCart = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const cart = await this.cartService.getCart(req.user.userId);

      res.status(200).json({
        success: true,
        data: cart,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /cart/items
   * Add item to cart
   */
  addToCart = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const data = addToCartSchema.parse(req.body);
      const cart = await this.cartService.addToCart(req.user.userId, data);

      res.status(200).json({
        success: true,
        data: cart,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /cart/items/:id
   * Update cart item
   */
  updateCartItem = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const { id } = cartItemIdParamSchema.parse(req.params);
      const data = updateCartItemSchema.parse(req.body);
      const cart = await this.cartService.updateCartItem(req.user.userId, id, data);

      res.status(200).json({
        success: true,
        data: cart,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /cart/items/:id
   * Remove item from cart
   */
  removeCartItem = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const { id } = cartItemIdParamSchema.parse(req.params);
      const cart = await this.cartService.removeCartItem(req.user.userId, id);

      res.status(200).json({
        success: true,
        data: cart,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /cart
   * Clear cart
   */
  clearCart = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      await this.cartService.clearCart(req.user.userId);

      res.status(200).json({
        success: true,
        data: { message: 'Cart cleared successfully' },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /cart/calculate
   * Calculate cart totals
   */
  calculateCart = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const data = calculateCartSchema.parse(req.body);
      const calculation = await this.cartService.calculateCart(
        req.user.userId,
        data.couponCode,
        data.pincode,
      );

      res.status(200).json({
        success: true,
        data: calculation,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
