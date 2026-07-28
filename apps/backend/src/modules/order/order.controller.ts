import type { Request, Response, NextFunction } from 'express';
import type { IOrderService } from './order.types.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
  orderNumberParamSchema,
  orderQuerySchema,
  refundRequestSchema,
} from './order.schema.js';

/**
 * Order controller
 */
export class OrderController {
  private readonly orderService: IOrderService;

  constructor(orderService: IOrderService) {
    this.orderService = orderService;
  }

  /**
   * POST /orders
   * Create order from cart
   */
  createOrder = async (
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

      const data = createOrderSchema.parse(req.body);
      const order = await this.orderService.createOrder(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: order,
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
   * GET /orders
   * Get user orders
   */
  getUserOrders = async (
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

      const query = orderQuerySchema.parse(req.query);
      const orders = await this.orderService.getUserOrders(
        req.user.userId,
        query.cursor,
        query.limit,
      );

      res.status(200).json({
        success: true,
        data: orders.data,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
          pagination: {
            cursor: query.cursor || null,
            nextCursor: orders.nextCursor,
            hasMore: orders.hasMore,
            limit: query.limit,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /orders/:id
   * Get order by ID
   */
  getOrderById = async (
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

      const { id } = orderIdParamSchema.parse(req.params);
      const order = await this.orderService.getOrderById(
        id,
        req.user.userId,
        req.user.role,
      );

      res.status(200).json({
        success: true,
        data: order,
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
   * GET /orders/by-number/:orderNumber
   * Get order by order number
   */
  getOrderByNumber = async (
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

      const { orderNumber } = orderNumberParamSchema.parse(req.params);
      const order = await this.orderService.getOrderByNumber(
        orderNumber,
        req.user.userId,
        req.user.role,
      );

      res.status(200).json({
        success: true,
        data: order,
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
   * PATCH /orders/:id/status
   * Update order status (Admin only)
   */
  updateOrderStatus = async (
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

      const { id } = orderIdParamSchema.parse(req.params);
      const data = updateOrderStatusSchema.parse(req.body);
      const order = await this.orderService.updateOrderStatus(
        id,
        data,
        req.user.userId,
      );

      res.status(200).json({
        success: true,
        data: order,
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
   * POST /orders/:id/refund
   * Request refund
   */
  requestRefund = async (
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

      const { id } = orderIdParamSchema.parse(req.params);
      const data = refundRequestSchema.parse(req.body);
      await this.orderService.requestRefund(req.user.userId, id, data);

      res.status(200).json({
        success: true,
        data: { message: 'Refund request submitted successfully' },
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
   * POST /orders/:id/cancel
   * Cancel order
   */
  cancelOrder = async (
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

      const { id } = orderIdParamSchema.parse(req.params);
      await this.orderService.cancelOrder(req.user.userId, id);

      res.status(200).json({
        success: true,
        data: { message: 'Order cancelled successfully' },
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
