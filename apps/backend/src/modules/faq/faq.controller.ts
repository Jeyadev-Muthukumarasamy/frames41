import type { Request, Response, NextFunction } from 'express';
import type { IFAQService } from './faq.types.js';
import {
  createFAQSchema,
  updateFAQSchema,
  faqIdParamSchema,
  faqCategoryParamSchema,
  faqQuerySchema,
} from './faq.schema.js';

/**
 * FAQ controller
 */
export class FAQController {
  private readonly faqService: IFAQService;

  constructor(faqService: IFAQService) {
    this.faqService = faqService;
  }

  /**
   * GET /faqs
   * Get all FAQs
   */
  getFAQs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = faqQuerySchema.parse(req.query);
      const includeInactive = query?.includeInactive === 'true' && req.user?.role === 'ADMIN';

      const faqs = await this.faqService.getFAQs(query?.category, includeInactive);

      res.status(200).json({
        success: true,
        data: faqs,
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
   * GET /faqs/categories
   * Get all FAQ categories
   */
  getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const categories = await this.faqService.getCategories();

      res.status(200).json({
        success: true,
        data: categories,
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
   * GET /faqs/category/:category
   * Get FAQs by category
   */
  getFAQsByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { category } = faqCategoryParamSchema.parse(req.params);
      const faqs = await this.faqService.getFAQsByCategory(category);

      res.status(200).json({
        success: true,
        data: faqs,
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
   * GET /faqs/:id
   * Get FAQ by ID
   */
  getFAQById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = faqIdParamSchema.parse(req.params);
      const faq = await this.faqService.getFAQById(id);

      res.status(200).json({
        success: true,
        data: faq,
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
   * POST /faqs
   * Create FAQ (Admin only)
   */
  createFAQ = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = createFAQSchema.parse(req.body);
      const faq = await this.faqService.createFAQ(data);

      res.status(201).json({
        success: true,
        data: faq,
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
   * PATCH /faqs/:id
   * Update FAQ (Admin only)
   */
  updateFAQ = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = faqIdParamSchema.parse(req.params);
      const data = updateFAQSchema.parse(req.body);
      const faq = await this.faqService.updateFAQ(id, data);

      res.status(200).json({
        success: true,
        data: faq,
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
   * DELETE /faqs/:id
   * Delete FAQ (Admin only)
   */
  deleteFAQ = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = faqIdParamSchema.parse(req.params);
      await this.faqService.deleteFAQ(id);

      res.status(200).json({
        success: true,
        data: { message: 'FAQ deleted successfully' },
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
