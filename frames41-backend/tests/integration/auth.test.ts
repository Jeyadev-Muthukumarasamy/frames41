import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';
import { hash } from 'argon2';

describe('Auth Integration Tests', () => {
  const app = createApp();
  const testEmail = 'testuser@frames41.com';
  const testPassword = 'Password123';

  beforeEach(async () => {
    await prisma.emailVerificationToken.deleteMany({ where: { email: testEmail } });
    await prisma.refreshToken.deleteMany({
      where: { user: { email: testEmail } },
    });
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should create an unverified user and return expiresIn', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({ email: testEmail, password: testPassword, name: 'Test' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expiresIn).toBe(600);

      const user = await prisma.user.findUnique({ where: { email: testEmail } });
      expect(user).not.toBeNull();
      expect(user?.isVerified).toBe(false);
      expect(user?.passwordHash).not.toBe('');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({ email: 'not-an-email', password: testPassword })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({ email: testEmail, password: 'short1' })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/verify-email', () => {
    it('should verify code and return tokens', async () => {
      // Create unverified user + verification token
      const passwordHash = await hash(testPassword, {
        type: 2,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
      const user = await prisma.user.create({
        data: { email: testEmail, passwordHash, isVerified: false },
      });

      const code = '123456';
      const codeHash = await hash(code, {
        type: 2,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
      await prisma.emailVerificationToken.create({
        data: {
          email: testEmail,
          codeHash,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          ipAddress: '127.0.0.1',
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ email: testEmail, code })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.isNewUser).toBe(true);

      const refreshed = await prisma.user.findUnique({ where: { id: user.id } });
      expect(refreshed?.isVerified).toBe(true);
    });

    it('should reject invalid code', async () => {
      await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: await hash(testPassword, { type: 2 }),
          isVerified: false,
        },
      });

      const code = '123456';
      const codeHash = await hash(code, { type: 2 });
      await prisma.emailVerificationToken.create({
        data: {
          email: testEmail,
          codeHash,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          ipAddress: '127.0.0.1',
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ email: testEmail, code: '999999' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    it('should reject expired code', async () => {
      await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: await hash(testPassword, { type: 2 }),
          isVerified: false,
        },
      });

      const code = '123456';
      const codeHash = await hash(code, { type: 2 });
      await prisma.emailVerificationToken.create({
        data: {
          email: testEmail,
          codeHash,
          expiresAt: new Date(Date.now() - 1000), // expired
          ipAddress: '127.0.0.1',
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ email: testEmail, code })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login verified user with correct credentials', async () => {
      const passwordHash = await hash(testPassword, { type: 2 });
      await prisma.user.create({
        data: { email: testEmail, passwordHash, isVerified: true },
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const passwordHash = await hash(testPassword, { type: 2 });
      await prisma.user.create({
        data: { email: testEmail, passwordHash, isVerified: true },
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: 'WrongPassword1' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject unverified user', async () => {
      const passwordHash = await hash(testPassword, { type: 2 });
      await prisma.user.create({
        data: { email: testEmail, passwordHash, isVerified: false },
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const passwordHash = await hash(testPassword, { type: 2 });
      const user = await prisma.user.create({
        data: { email: testEmail, passwordHash, isVerified: true },
      });

      const refreshToken = 'test_refresh_token_123';
      const tokenHash = require('crypto')
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          family: 'test_family',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid_token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const passwordHash = await hash(testPassword, { type: 2 });
      const user = await prisma.user.create({
        data: { email: testEmail, passwordHash, isVerified: true },
      });

      const refreshToken = 'test_refresh_token_123';
      const tokenHash = require('crypto')
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          family: 'test_family',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logged out successfully');

      const storedToken = await prisma.refreshToken.findUnique({
        where: { tokenHash },
      });
      expect(storedToken?.revokedAt).toBeDefined();
    });
  });
});