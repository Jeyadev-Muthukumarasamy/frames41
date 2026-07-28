/**
 * Admin Zod schemas
 */

import { z } from 'zod';
import { OrderStatus, RefundStatus } from '@prisma/client';

// Dashboard query
export const dashboardQuerySchema = z.object({
  query: z.object({
    period: z.enum(['today', 'week', 'month', 'year']).optional().default('today'),
  }),
});

// Analytics query
export const analyticsQuerySchema = z.object({
  query: z.object({
    period: z.enum(['today', 'week', 'month', 'year', 'custom']).optional().default('month'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Top products query
export const topProductsQuerySchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).default('10'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Customer list query
export const customerListQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
    search: z.string().optional(),
  }),
});

// Customer params
export const customerParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid customer ID'),
  }),
});

// Order list query
export const orderListQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
    status: z.nativeEnum(OrderStatus).optional(),
    search: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Order params
export const orderParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
});

// Update order status
export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus, { message: 'Invalid order status' }),
    note: z.string().max(500).optional(),
  }),
});

// Add tracking
export const addTrackingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    awbCode: z.string().min(3).max(50),
    trackingUrl: z.string().url().optional(),
  }),
});

// Refund list query
export const refundListQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
    status: z.nativeEnum(RefundStatus).optional(),
  }),
});

// Refund params
export const refundParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid refund ID'),
  }),
});

// Process refund
export const processRefundSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid refund ID'),
  }),
  body: z.object({
    status: z.nativeEnum(RefundStatus, { message: 'Invalid refund status' }),
    adminNote: z.string().max(1000).optional(),
  }),
});

// Low stock query
export const lowStockQuerySchema = z.object({
  query: z.object({
    threshold: z.string().transform(Number).default('10'),
  }),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>['query'];
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>['query'];
export type CustomerListQueryInput = z.infer<typeof customerListQuerySchema>['query'];
export type OrderListQueryInput = z.infer<typeof orderListQuerySchema>['query'];
export type RefundListQueryInput = z.infer<typeof refundListQuerySchema>['query'];
