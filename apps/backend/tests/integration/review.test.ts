import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';
import { OrderStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';

describe('Review Integration Tests', () => {
  const app = createApp();
  let authToken: string;
  let userId: string;
  let productId: string;
  let orderId: string;
  let categoryId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'user9876543212@frames41.test',
        passwordHash: 'test-hash-not-real',
        phone: '9876543212',
        name: 'Test User',
        role: 'USER',
      },
    });
    userId = user.id;

    // Create auth token
    authToken = jwt.sign(
      { userId: user.id, role: user.role, type: 'access' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    // Create test category
    const category = await prisma.category.create({
      data: {
        slug: 'test-category-review',
        name: 'Test Category',
        isActive: true,
      },
    });
    categoryId = category.id;

    // Create test product
    const product = await prisma.product.create({
      data: {
        slug: 'test-product-review',
        name: 'Test Product',
        description: 'Test description',
        basePrice: 499.00,
        sku: 'TEST-002',
        stock: 10,
        isActive: true,
        categoryId: category.id,
      },
    });
    productId = product.id;

    // Create delivered order with product
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        userId,
        status: OrderStatus.DELIVERED,
        subtotal: 499.00,
        shippingCharge: 50.00,
        total: 549.00,
        addressSnapshot: {},
        placedAt: new Date(),
        deliveredAt: new Date(),
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

    // Clean up reviews
    await prisma.review.deleteMany({ where: { userId } });
  });

  describe('GET /api/v1/reviews/product/:productId', () => {
    it('should get product reviews', async () => {
      // Create a review first
      await prisma.review.create({
        data: {
          productId,
          userId,
          orderId,
          rating: 5,
          title: 'Great product!',
          body: 'Really loved this product. Highly recommended!',
          isVerified: true,
          isApproved: true,
        },
      });

      const response = await request(app)
        .get(`/api/v1/reviews/product/${productId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].rating).toBe(5);
    });

    it('should return empty array for product with no reviews', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/product/${productId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/v1/reviews/product/:productId/summary', () => {
    it('should get review summary', async () => {
      // Create multiple reviews
      await prisma.review.create({
        data: {
          productId,
          userId,
          rating: 5,
          body: 'Excellent!',
          isVerified: true,
          isApproved: true,
        },
      });

      const response = await request(app)
        .get(`/api/v1/reviews/product/${productId}/summary`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.averageRating).toBe(5);
      expect(response.body.data.totalReviews).toBe(1);
    });
  });

  describe('POST /api/v1/reviews', () => {
    it('should create verified review with delivered order', async () => {
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId,
          orderId,
          rating: 5,
          title: 'Excellent!',
          body: 'This product exceeded my expectations. Great quality!',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isVerified).toBe(true);
      expect(response.body.data.isApproved).toBe(true);
    });

    it('should reject review without purchase', async () => {
      // Create new product without order
      const newProduct = await prisma.product.create({
        data: {
          slug: 'new-product-no-order',
          name: 'New Product',
          description: 'Description',
          basePrice: 299.00,
          sku: 'TEST-NO-ORDER',
          stock: 10,
          isActive: true,
          categoryId,
        },
      });

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: newProduct.id,
          rating: 5,
          title: 'Great!',
          body: 'Amazing product!',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate review', async () => {
      // First review
      await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId,
          orderId,
          rating: 5,
          body: 'First review',
        })
        .expect(201);

      // Duplicate review
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId,
          orderId,
          rating: 4,
          body: 'Second review',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid rating', async () => {
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId,
          orderId,
          rating: 6, // Invalid: max is 5
          body: 'Test review',
        })
        .expect(422);

      expect(response.body.success).toBe(false);
    });

    it('should reject short review body', async () => {
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId,
          orderId,
          rating: 5,
          body: 'Short', // Less than 10 characters
        })
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/reviews/:id', () => {
    let reviewId: string;

    beforeEach(async () => {
      const review = await prisma.review.create({
        data: {
          productId,
          userId,
          orderId,
          rating: 4,
          body: 'Good product but could be better',
          isVerified: true,
          isApproved: true,
        },
      });
      reviewId = review.id;
    });

    it('should update own review', async () => {
      const response = await request(app)
        .patch(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 5,
          body: 'Updated review: Actually this is amazing!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(5);
    });
  });

  describe('DELETE /api/v1/reviews/:id', () => {
    it('should delete own review', async () => {
      const review = await prisma.review.create({
        data: {
          productId,
          userId,
          rating: 3,
          body: 'Average product',
          isVerified: true,
          isApproved: true,
        },
      });

      const response = await request(app)
        .delete(`/api/v1/reviews/${review.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/reviews/:id/helpful', () => {
    it('should mark review as helpful', async () => {
      const review = await prisma.review.create({
        data: {
          productId,
          userId,
          rating: 5,
          body: 'Very helpful review',
          isVerified: true,
          isApproved: true,
          helpfulCount: 0,
        },
      });

      const response = await request(app)
        .post(`/api/v1/reviews/${review.id}/helpful`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify count was incremented
      const updatedReview = await prisma.review.findUnique({
        where: { id: review.id },
      });
      expect(updatedReview?.helpfulCount).toBe(1);
    });
  });

  describe('GET /api/v1/reviews/my-reviews', () => {
    it('should get user reviews', async () => {
      await prisma.review.create({
        data: {
          productId,
          userId,
          rating: 5,
          body: 'My review',
          isVerified: true,
          isApproved: true,
        },
      });

      const response = await request(app)
        .get('/api/v1/reviews/my-reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });
});
