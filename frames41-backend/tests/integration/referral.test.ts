import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';
import jwt from 'jsonwebtoken';

describe('Referral Integration Tests', () => {
  const app = createApp();
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'user9876543213@frames41.test',
        passwordHash: 'test-hash-not-real',
        phone: '9876543213',
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

    // Clean up
    await prisma.referralRedemption.deleteMany({});
    await prisma.referralCode.deleteMany({ where: { ownerUserId: userId } });
  });

  describe('POST /api/v1/referrals', () => {
    it('should create referral code', async () => {
      const response = await request(app)
        .post('/api/v1/referrals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'TESTCODE',
          ownerName: 'Test Owner',
          ownerPhone: '9876543210',
          discountPercent: 10,
          commissionPercent: 5,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('TESTCODE');
      expect(response.body.data.discountPercent).toBe(10);
      expect(response.body.data.commissionPercent).toBe(5);
    });

    it('should reject duplicate code', async () => {
      // Create first code
      await request(app)
        .post('/api/v1/referrals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'DUPLICATE',
          ownerName: 'Test Owner',
          discountPercent: 10,
          commissionPercent: 5,
        })
        .expect(201);

      // Create second user
      const user2 = await prisma.user.create({
        data: {
          email: 'user9876543214@frames41.test',
          passwordHash: 'test-hash-not-real',
          phone: '9876543214',
          name: 'Test User 2',
          role: 'USER',
        },
      });

      const authToken2 = jwt.sign(
        { userId: user2.id, role: user2.role, type: 'access' },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '15m' }
      );

      // Try duplicate code
      const response = await request(app)
        .post('/api/v1/referrals')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          code: 'DUPLICATE',
          ownerName: 'Test Owner 2',
          discountPercent: 15,
          commissionPercent: 5,
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should reject user with existing referral code', async () => {
      // Create first code
      await request(app)
        .post('/api/v1/referrals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'FIRSTCODE',
          ownerName: 'Test Owner',
          discountPercent: 10,
          commissionPercent: 5,
        })
        .expect(201);

      // Try second code for same user
      const response = await request(app)
        .post('/api/v1/referrals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'SECONDCODE',
          ownerName: 'Test Owner',
          discountPercent: 15,
          commissionPercent: 5,
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/referrals/code/:code', () => {
    it('should get referral code by code', async () => {
      // Create referral code directly
      await prisma.referralCode.create({
        data: {
          code: 'GETCODE',
          ownerName: 'Test Owner',
          discountPercent: 10,
          commissionPercent: 5,
        },
      });

      const response = await request(app)
        .get('/api/v1/referrals/code/GETCODE')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('GETCODE');
    });

    it('should return 404 for non-existent code', async () => {
      const response = await request(app)
        .get('/api/v1/referrals/code/NONEXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/referrals/my-code', () => {
    it('should get user referral code', async () => {
      // Create referral code
      await prisma.referralCode.create({
        data: {
          code: 'MYCODE',
          ownerUserId: userId,
          ownerName: 'Test Owner',
          discountPercent: 10,
          commissionPercent: 5,
        },
      });

      const response = await request(app)
        .get('/api/v1/referrals/my-code')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('MYCODE');
    });

    it('should return 404 when user has no code', async () => {
      const response = await request(app)
        .get('/api/v1/referrals/my-code')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/referrals/validate', () => {
    it('should validate active referral code', async () => {
      // Create referral code
      await prisma.referralCode.create({
        data: {
          code: 'VALIDCODE',
          ownerName: 'Test Owner',
          discountPercent: 10,
          commissionPercent: 5,
          isActive: true,
        },
      });

      const response = await request(app)
        .get('/api/v1/referrals/validate?code=VALIDCODE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.discountPercent).toBe(10);
    });

    it('should reject self-referral', async () => {
      // Create referral code for current user
      await prisma.referralCode.create({
        data: {
          code: 'SELFCODE',
          ownerUserId: userId,
          ownerName: 'Test Owner',
          discountPercent: 10,
          commissionPercent: 5,
        },
      });

      const response = await request(app)
        .get('/api/v1/referrals/validate?code=SELFCODE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
    });

    it('should reject already used code', async () => {
      // Create another user with referral code
      const referrer = await prisma.user.create({
        data: {
          email: 'user9999999999@frames41.test',
          passwordHash: 'test-hash-not-real',
          phone: '9999999999',
          name: 'Referrer',
          role: 'USER',
        },
      });

      const referralCode = await prisma.referralCode.create({
        data: {
          code: 'USEDCODE',
          ownerUserId: referrer.id,
          ownerName: 'Referrer',
          discountPercent: 10,
          commissionPercent: 5,
        },
      });

      // Create order for redemption
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-TEST',
          userId,
          status: 'DELIVERED',
          subtotal: 1000,
          shippingCharge: 50,
          total: 1050,
          addressSnapshot: {},
        },
      });

      // Create redemption
      await prisma.referralRedemption.create({
        data: {
          referralCodeId: referralCode.id,
          userId,
          orderId: order.id,
          discountAmount: 100,
          commissionAmount: 50,
        },
      });

      const response = await request(app)
        .get('/api/v1/referrals/validate?code=USEDCODE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
    });
  });
});
