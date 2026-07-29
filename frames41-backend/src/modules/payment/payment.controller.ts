import type { Request, Response, NextFunction } from 'express';
import type { PaymentService } from './payment.service.js';
import { createPaymentSchema, verifyPaymentSchema } from './payment.schema.js';

/**
 * Payment controller
 */
export class PaymentController {
  private readonly paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  /**
   * POST /payments/create
   * Create Razorpay order
   */
  createPayment = async (
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

      const data = createPaymentSchema.parse(req.body);
      const paymentData = await this.paymentService.createRazorpayOrder(
        data.orderId,
        req.user.userId,
      );

      res.status(200).json({
        success: true,
        data: paymentData,
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
   * POST /payments/verify
   * Verify payment
   */
  verifyPayment = async (
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

      const data = verifyPaymentSchema.parse(req.body);
      await this.paymentService.verifyPayment({
        ...data,
        userId: req.user.userId,
      });

      res.status(200).json({
        success: true,
        data: { message: 'Payment verified successfully' },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  cashOnDelivery = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const data = createPaymentSchema.parse(req.body);
      await this.paymentService.placeCashOnDelivery(data.orderId, req.user.userId);

      res.status(200).json({
        success: true,
        data: { message: 'Cash on delivery order placed successfully' },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /payments/order/:orderId
   * Get payment by order ID
   */
  getPaymentByOrderId = async (
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

      const orderId = req.params.orderId;
      if (!orderId) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Order ID is required' },
        });
        return;
      }
      const payment = await this.paymentService.getPaymentByOrderId(
        orderId,
        req.user.userId,
      );

      res.status(200).json({
        success: true,
        data: payment,
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
