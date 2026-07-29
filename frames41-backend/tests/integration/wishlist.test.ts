import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';
import { OrderStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';

describe('Wishlist Integration Tests', () => {
  const app = createApp();
  let authToken: string;
  let userId: string;
  let productId: string;
  let categoryId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'user9876543211@frames41.test',
        passwordHash: 'test-hash-not-real',
        phone: '9876543211',
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
        slug: 'test-category',
        name: 'Test Category',
        isActive: true,
      },
    });
    categoryId = category.id;

    // Create test product
    const product = await prisma.product.create({
      data: {
        slug: 'test-product',
        name: 'Test Product',
        description: 'Test description',
        basePrice: 499.00,
        sku: 'TEST-001',
        stock: 10,
        isActive: true,
        categoryId: category.id,
      },
    });
    productId = product.id;

    // Clean up wishlist
    await prisma.wishlist.deleteMany({ where: { userId } });
  });

  describe('GET /api/v1/wishlist', () => {
    it('should get empty wishlist', async () => {
      const response = await request(app)
        .get('/api/v1/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.itemCount).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/wishlist')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/wishlist', () => {
    it('should add product to wishlist', async () => {
      const response = await request(app)
        .post('/api/v1/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].productId).toBe(productId);
    });

    it('should reject duplicate wishlist items', async () => {
      // First add
      await request(app)
        .post('/api/v1/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId })
        .expect(201);

      // Try duplicate
      const response = await request(app)
        .post('/api/v1/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should reject invalid product ID', async () => {
      const response = await request(app)
        .post('/api/v1/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: 'invalid-uuid' })
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/wishlist/:productId', () => {
    beforeEach(async () => {
      // Add product to wishlist
      await prisma.wishlist.create({
        data: {
          userId,
          productId,
        },
      });
    });

    it('should remove product from wishlist', async () => {
      const response = await request(app)
        .delete(`/api/v1/wishlist/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(0);
    });

    it('should reject removing non-existent item', async () => {
      const response = await request(app)
        .delete(`/api/v1/wishlist/${crypto.randomUUID()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/wishlist/toggle', () => {
    it('should add product when not in wishlist', async () => {
      const response = await request(app)
        .post('/api/v1/wishlist/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.added).toBe(true);
    });

    it('should remove product when in wishlist', async () => {
      // First add
      await prisma.wishlist.create({
        data: { userId, productId },
      });

      const response = await request(app)
        .post('/api/v1/wishlist/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.added).toBe(false);
    });
  });
});
