/**
 * Admin controller
 */

import type { Request, Response, NextFunction } from 'express';
import type { IAdminService } from './admin.types.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

function parseDateRange(startStr?: unknown, endStr?: unknown): { startDate?: Date; endDate?: Date } {
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startStr && typeof startStr === 'string') {
    const d = new Date(startStr);
    if (!isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0);
      startDate = d;
    }
  }

  if (endStr && typeof endStr === 'string') {
    const d = new Date(endStr);
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      endDate = d;
    }
  }

  return { startDate, endDate };
}

export class AdminController {
  private readonly service: IAdminService;

  constructor(service: IAdminService) {
    this.service = service;
  }

  /**
   * Get combined dashboard data (stats + analytics + topProducts in 1 API call)
   */
  getCombinedDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as string) || 'day';
      const { startDate, endDate } = parseDateRange(req.query.startDate, req.query.endDate);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

      const [stats, analytics, topProducts] = await Promise.all([
        this.service.getDashboardStats(),
        this.service.getAnalytics(period, startDate, endDate),
        this.service.getTopProducts(limit, startDate, endDate),
      ]);

      res.status(200).json({
        success: true,
        data: { stats, analytics, topProducts },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get dashboard stats
   */
  getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getDashboardStats();

      res.status(200).json({
        success: true,
        data: stats,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get analytics
   */
  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { period } = req.query;
      const { startDate: parsedStartDate, endDate: parsedEndDate } = parseDateRange(req.query.startDate, req.query.endDate);

      const analytics = await this.service.getAnalytics(
        period as string,
        parsedStartDate,
        parsedEndDate,
      );

      res.status(200).json({
        success: true,
        data: analytics,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get top products
   */
  getTopProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const { startDate, endDate } = parseDateRange(req.query.startDate, req.query.endDate);

      const products = await this.service.getTopProducts(limit, startDate, endDate);

      res.status(200).json({
        success: true,
        data: products,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customers list
   */
  getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;

      const result = await this.service.getCustomers({ page, limit, search });

      res.status(200).json({
        success: true,
        data: result.customers,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customer by ID
   */
  getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.service.getCustomerById(id);

      res.status(200).json({
        success: true,
        data: customer,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get orders list
   */
  getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const status = req.query.status as import('@prisma/client').OrderStatus | undefined;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const { startDate, endDate } = parseDateRange(req.query.startDate, req.query.endDate);

      const result = await this.service.getOrders({ page, limit, status, search, startDate, endDate });

      res.status(200).json({
        success: true,
        data: result.orders,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get order by ID
   */
  getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.service.getOrderById(id);

      res.status(200).json({
        success: true,
        data: order,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update order status
   */
  updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        throw new BadRequestError('Admin ID required');
      }

      const updated = await this.service.updateOrderStatus(id, req.body, adminId);

      res.status(200).json({
        success: true,
        data: updated,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add tracking to order
   */
  addTracking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await this.service.addTrackingToOrder(id, req.body);

      res.status(200).json({
        success: true,
        data: updated,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get refunds
   */
  getRefunds = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const status = req.query.status as import('@prisma/client').RefundStatus | undefined;

      const result = await this.service.getRefunds({ page, limit, status });

      res.status(200).json({
        success: true,
        data: result.refunds,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Process refund
   */
  processRefund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await this.service.processRefund(id, req.body);

      res.status(200).json({
        success: true,
        data: updated,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}
