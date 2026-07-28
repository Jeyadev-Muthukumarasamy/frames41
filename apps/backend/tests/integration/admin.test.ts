/**
 * Admin module integration tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';
import { OrderStatus, RefundStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';

describe('Admin Integration Tests', () => {
  const app = createApp();
  let adminToken: string;
  let adminId: string;
  let userToken: string;
  let userId: string;
  let productId: string;
  let orderId: string;
  let refundId: string;

  beforeEach(async () => {
    // Clean up
    await prisma.auditLog.deleteMany({});
    await prisma.orderStatusHistory.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.refundRequest.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({ where: { phone: { in: ['9998887771', '9998887772'] } } });

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'user9998887771@frames41.test',
        passwordHash: 'test-hash-not-real',
        phone: '9998887771',
        name: 'Admin User',
        role: 'ADMIN',
      },
    });
    adminId = admin.id;
    adminToken = jwt.sign(
      { userId: admin.id, role: admin.role, type: 'access' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    // Create regular user
    const user = await prisma.user.create({
      data: {
        email: 'user9998887772@frames41.test',
        passwordHash: 'test-hash-not-real',
        phone: '9998887772',
        name: 'Regular User',
        role: 'USER',
      },
    });
    userId = user.id;
    userToken = jwt.sign(
      { userId: user.id, role: user.role, type: 'access' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    // Create category
    const category = await prisma.category.create({
      data: {
        slug: 'test-admin-category',
        name: 'Test Admin Category',
        isActive: true,
      },
    });

    // Create product
    const product = await prisma.product.create({
      data: {
        slug: 'test-admin-product',
        name: 'Test Admin Product',
        description: 'Test description',
        basePrice: 499.00,
        sku: 'ADMIN-001',
        stock: 5,
        isActive: true,
        categoryId: category.id,
      },
    });
    productId = product.id;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ADMIN-ORD-${Date.now()}`,
        userId,
        status: OrderStatus.PENDING,
        subtotal: 499.00,
        shippingCharge: 50.00,
        total: 549.00,
        addressSnapshot: {},
        items: {
          create: {
            productId,
            productSnapshot: {},
            quantity: 1,
            unitPrice: 499.00,
            totalPrice: 499.00,
          },
        },
      },
    });
    orderId = order.id;

    // Create refund request
    const refund = await prisma.refundRequest.create({
      data: {
        orderId,
        userId,
        reason: 'Product damaged',
        status: RefundStatus.PENDING,
      },
    });
    refundId = refund.id;
  });

  describe('GET /api/v1/admin/dashboard/stats', () => {
    it('should get dashboard stats as admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalUsers).toBe(2);
      expect(response.body.data.totalOrders).toBe(1);
      expect(response.body.data.pendingOrders).toBe(1);
      expect(response.body.data.lowStockProducts).toBe(1);
    });

    it('should reject non-admin user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/dashboard/analytics', () => {
    it('should get monthly analytics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/analytics?period=month')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gmv).toBeDefined();
      expect(response.body.data.aov).toBeDefined();
      expect(response.body.data.totalOrders).toBeDefined();
    });

    it('should get custom period analytics', async () => {
      const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const end = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v1/admin/dashboard/analytics?period=custom&startDate=${start}&endDate=${end}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/admin/dashboard/top-products', () => {
    it('should get top products', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/top-products?limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/admin/customers', () => {
    it('should get customers list', async () => {
      const response = await request(app)
        .get('/api/v1/admin/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });

    it('should search customers', async () => {
      const response = await request(app)
        .get('/api/v1/admin/customers?search=Admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Admin User');
    });
  });

  describe('GET /api/v1/admin/customers/:id', () => {
    it('should get customer detail', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/customers/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.orders).toBeDefined();
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/customers/${crypto.randomUUID()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/orders', () => {
    it('should get orders list', async () => {
      const response = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/orders?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should search orders', async () => {
      const response = await request(app)
        .get('/api/v1/admin/orders?search=ADMIN-ORD')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/admin/orders/:id', () => {
    it('should get order detail', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.items).toBeDefined();
    });
  });

  describe('PATCH /api/v1/admin/orders/:id/status', () => {
    it('should update order status', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PROCESSING', note: 'Order confirmed' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify status history was created
      const history = await prisma.orderStatusHistory.findMany({
        where: { orderId },
      });
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe('PROCESSING');
    });

    it('should reject invalid status transition', async () => {
      // First update to DELIVERED
      await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.DELIVERED },
      });

      const response = await request(app)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PENDING' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid status transition');
    });

    it('should reject invalid status enum', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/admin/orders/:id/tracking', () => {
    it('should add tracking to order', async () => {
      const response = await request(app)
        .post(`/api/v1/admin/orders/${orderId}/tracking`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ awbCode: 'TRACK123456', trackingUrl: 'https://shiprocket.com/track/TRACK123456' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify tracking was added
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      expect(order?.awbCode).toBe('TRACK123456');
    });
  });

  describe('GET /api/v1/admin/refunds', () => {
    it('should get refunds list', async () => {
      const response = await request(app)
        .get('/api/v1/admin/refunds')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('PENDING');
    });

    it('should filter refunds by status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/refunds?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('PATCH /api/v1/admin/refunds/:id', () => {
    it('should approve refund', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/refunds/${refundId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED', adminNote: 'Refund approved by admin' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify refund was processed
      const refund = await prisma.refundRequest.findUnique({ where: { id: refundId } });
      expect(refund?.status).toBe('APPROVED');
      expect(refund?.adminNote).toBe('Refund approved by admin');
      expect(refund?.processedAt).toBeDefined();
    });

    it('should reject processing already processed refund', async () => {
      // First process the refund
      await prisma.refundRequest.update({
        where: { id: refundId },
        data: { status: RefundStatus.APPROVED, processedAt: new Date() },
      });

      const response = await request(app)
        .patch(`/api/v1/admin/refunds/${refundId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'REJECTED' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already been processed');
    });
  });
});
