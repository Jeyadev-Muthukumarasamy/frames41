import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';
import { hash } from 'argon2';
import crypto from 'crypto';

describe('Auth Integration Tests', () => {
  const app = createApp();
  const testEmail = 'admin@frames41.test';
  const testPassword = 'Password123!';
  const testPhone = '9876543210';

  beforeEach(async () => {
    await prisma.emailVerificationToken.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/v1/auth/dashboard-login', () => {
    it('should login admin with valid credentials', async () => {
      const passwordHash = await hash(testPassword);
      await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash,
          phone: testPhone,
          name: 'Admin',
          role: 'ADMIN',
          isVerified: true,
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/dashboard-login')
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/dashboard-login')
        .send({ email: testEmail, password: 'WrongPassword' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/phone', () => {
    it('should authenticate user with phone and return tokens', async () => {
      const response = await request(app)
        .post('/api/v1/auth/phone')
        .send({ phone: testPhone })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject invalid phone format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/phone')
        .send({ phone: '123' })
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/send-otp', () => {
    it('should send OTP to phone number', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send-otp')
        .send({ phone: testPhone })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('OTP sent to your phone');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'customer@frames41.test',
          phone: testPhone,
          role: 'USER',
        },
      });

      const refreshToken = 'test_refresh_token_12345';
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          family: 'family_123',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'customer@frames41.test',
          phone: testPhone,
          role: 'USER',
        },
      });

      const refreshToken = 'test_refresh_token_logout';
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          family: 'family_456',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});