import type { Request, Response, NextFunction } from 'express';
import type { INewsletterService } from './newsletter.types.js';
import {
  subscribeNewsletterSchema,
  unsubscribeNewsletterSchema,
} from './newsletter.schema.js';

/**
 * Newsletter controller
 */
export class NewsletterController {
  private readonly newsletterService: INewsletterService;

  constructor(newsletterService: INewsletterService) {
    this.newsletterService = newsletterService;
  }

  /**
   * POST /newsletter/subscribe
   * Subscribe to newsletter
   */
  subscribe = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = subscribeNewsletterSchema.parse(req.body);
      const subscriber = await this.newsletterService.subscribe(data);

      res.status(200).json({
        success: true,
        data: {
          message: 'Successfully subscribed to newsletter',
          email: subscriber.email,
        },
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
   * POST /newsletter/unsubscribe
   * Unsubscribe from newsletter
   */
  unsubscribe = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = unsubscribeNewsletterSchema.parse(req.body);
      await this.newsletterService.unsubscribe(data.email);

      res.status(200).json({
        success: true,
        data: { message: 'Successfully unsubscribed from newsletter' },
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
   * GET /newsletter/count
   * Get subscriber count (Admin only)
   */
  getSubscriberCount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const count = await this.newsletterService.getSubscriberCount();

      res.status(200).json({
        success: true,
        data: { count },
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
