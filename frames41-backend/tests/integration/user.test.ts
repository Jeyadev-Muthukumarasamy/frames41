import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';

describe('User Integration Tests', () => {
  const app = createApp();
  let authToken: string;
  let userId: string;
  const testPhone = '9876543210';

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { phone: testPhone } });

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'test-hash-not-real',
        phone: testPhone,
        name: 'Test User',
      },
    });
    userId = user.id;

    // Generate auth token
    authToken = jwt.sign(
      { userId: user.id, role: 'USER', type: 'access' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' },
    );
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { phone: testPhone } });
  });

  describe('GET /api/v1/users/me', () => {
    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.phone).toBe(testPhone);
      expect(response.body.data.name).toBe('Test User');
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name', email: 'updated@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.email).toBe('updated@example.com');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should allow clearing email', async () => {
      const response = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: null })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBeNull();
    });
  });

  describe('GET /api/v1/users/me/addresses', () => {
    it('should return empty addresses list', async () => {
      const response = await request(app)
        .get('/api/v1/users/me/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('POST /api/v1/users/me/addresses', () => {
    it('should create address successfully', async () => {
      const addressData = {
        line1: '123 Test Street',
        line2: 'Apt 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      };

      const response = await request(app)
        .post('/api/v1/users/me/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addressData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.line1).toBe(addressData.line1);
      expect(response.body.data.city).toBe(addressData.city);
      expect(response.body.data.isDefault).toBe(true); // First address is default
    });

    it('should reject invalid pincode', async () => {
      const response = await request(app)
        .post('/api/v1/users/me/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          line1: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '123', // Invalid
        })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/users/me/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          line1: '123 Test Street',
          // Missing city, state, pincode
        })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/users/me/addresses/:id', () => {
    it('should get specific address', async () => {
      // Create address first
      const address = await prisma.address.create({
        data: {
          userId,
          line1: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true,
        },
      });

      const response = await request(app)
        .get(`/api/v1/users/me/addresses/${address.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(address.id);
    });

    it('should reject access to non-existent address', async () => {
      const response = await request(app)
        .get('/api/v1/users/me/addresses/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/users/me/addresses/:id', () => {
    it('should update address successfully', async () => {
      // Create address first
      const address = await prisma.address.create({
        data: {
          userId,
          line1: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true,
        },
      });

      const response = await request(app)
        .patch(`/api/v1/users/me/addresses/${address.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ city: 'Delhi' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.city).toBe('Delhi');
    });
  });

  describe('DELETE /api/v1/users/me/addresses/:id', () => {
    it('should delete address successfully', async () => {
      // Create address first
      const address = await prisma.address.create({
        data: {
          userId,
          line1: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true,
        },
      });

      const response = await request(app)
        .delete(`/api/v1/users/me/addresses/${address.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Address deleted successfully');

      // Verify deletion
      const deletedAddress = await prisma.address.findUnique({
        where: { id: address.id },
      });
      expect(deletedAddress).toBeNull();
    });
  });
});
