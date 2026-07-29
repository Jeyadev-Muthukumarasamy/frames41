import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';
import jwt from 'jsonwebtoken';

describe('GiftCard Integration Tests', () => {
  const app = createApp();
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'user9876543215@frames41.test',
        passwordHash: 'test-hash-not-real',
        phone: '9876543215',
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
    await prisma.giftCardTransaction.deleteMany({});
    await prisma.giftCard.deleteMany({ where: { purchasedBy: userId } });
  });

  describe('POST /api/v1/gift-cards', () => {
    it('should create gift card', async () => {
      const response = await request(app)
        .post('/api/v1/gift-cards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          balance: 500,
          recipientPhone: '9876543210',
          recipientName: 'John Doe',
          message: 'Happy Birthday!',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.balance).toBe(500);
      expect(response.body.data.initialBalance).toBe(500);
      expect(response.body.data.code).toBeDefined();
      expect(response.body.data.isActive).toBe(true);
    });

    it('should reject gift card below minimum balance', async () => {
      const response = await request(app)
        .post('/api/v1/gift-cards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          balance: 25, // Below minimum of 50
        })
        .expect(422);

      expect(response.body.success).toBe(false);
    });

    it('should reject gift card above maximum balance', async () => {
      const response = await request(app)
        .post('/api/v1/gift-cards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          balance: 15000, // Above maximum of 10,000
        })
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/gift-cards/check/:code', () => {
    it('should get gift card public info', async () => {
      // Create gift card
      const giftCard = await prisma.giftCard.create({
        data: {
          code: 'TEST-GIFT-1234',
          balance: 500,
          initialBalance: 500,
          isActive: true,
        },
      });

      const response = await request(app)
        .get(`/api/v1/gift-cards/check/${giftCard.code}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.balance).toBe(500);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should return 404 for non-existent gift card', async () => {
      const response = await request(app)
        .get('/api/v1/gift-cards/check/INVALID-CODE')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/gift-cards/validate', () => {
    it('should validate active gift card', async () => {
      await prisma.giftCard.create({
        data: {
          code: 'VALID-GIFT-1234',
          balance: 500,
          initialBalance: 500,
          isActive: true,
        },
      });

      const response = await request(app)
        .get('/api/v1/gift-cards/validate?code=VALID-GIFT-1234')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.balance).toBe(500);
    });

    it('should reject inactive gift card', async () => {
      await prisma.giftCard.create({
        data: {
          code: 'INACTIVE-GIFT-1234',
          balance: 500,
          initialBalance: 500,
          isActive: false,
        },
      });

      const response = await request(app)
        .get('/api/v1/gift-cards/validate?code=INACTIVE-GIFT-1234')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
    });

    it('should reject expired gift card', async () => {
      await prisma.giftCard.create({
        data: {
          code: 'EXPIRED-GIFT-1234',
          balance: 500,
          initialBalance: 500,
          isActive: true,
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
      });

      const response = await request(app)
        .get('/api/v1/gift-cards/validate?code=EXPIRED-GIFT-1234')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
    });

    it('should reject gift card with zero balance', async () => {
      await prisma.giftCard.create({
        data: {
          code: 'ZERO-BALANCE-1234',
          balance: 0,
          initialBalance: 500,
          isActive: true,
        },
      });

      const response = await request(app)
        .get('/api/v1/gift-cards/validate?code=ZERO-BALANCE-1234')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
    });
  });

  describe('POST /api/v1/gift-cards/redeem', () => {
    it('should redeem gift card', async () => {
      // Create gift card
      const giftCard = await prisma.giftCard.create({
        data: {
          code: 'REDEEM-GIFT-1234',
          balance: 500,
          initialBalance: 500,
          isActive: true,
        },
      });

      const response = await request(app)
        .post('/api/v1/gift-cards/redeem')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: giftCard.code })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isRedeemed).toBe(true);
      expect(response.body.data.redeemedAt).toBeDefined();
    });

    it('should allow already redeemed by same user', async () => {
      // Create already redeemed gift card
      const giftCard = await prisma.giftCard.create({
        data: {
          code: 'ALREADY-REDEEMED-1234',
          balance: 500,
          initialBalance: 500,
          isActive: true,
          isRedeemed: true,
          redeemedBy: userId,
          redeemedAt: new Date(),
        },
      });

      const response = await request(app)
        .post('/api/v1/gift-cards/redeem')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: giftCard.code })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject already redeemed by different user', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'user9999999998@frames41.test',
          passwordHash: 'test-hash-not-real',
          phone: '9999999998',
          name: 'Other User',
          role: 'USER',
        },
      });

      // Create already redeemed gift card
      const giftCard = await prisma.giftCard.create({
        data: {
          code: 'OTHER-REDEEMED-1234',
          balance: 500,
          initialBalance: 500,
          isActive: true,
          isRedeemed: true,
          redeemedBy: otherUser.id,
          redeemedAt: new Date(),
        },
      });

      const response = await request(app)
        .post('/api/v1/gift-cards/redeem')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: giftCard.code })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/gift-cards/my-cards', () => {
    it('should get user gift cards', async () => {
      // Create purchased gift card
      await prisma.giftCard.create({
        data: {
          code: 'PURCHASED-1234',
          balance: 500,
          initialBalance: 500,
          purchasedBy: userId,
          isActive: true,
        },
      });

      // Create redeemed gift card
      await prisma.giftCard.create({
        data: {
          code: 'REDEEMED-1234',
          balance: 300,
          initialBalance: 500,
          redeemedBy: userId,
          isRedeemed: true,
          redeemedAt: new Date(),
          isActive: true,
        },
      });

      const response = await request(app)
        .get('/api/v1/gift-cards/my-cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.purchased).toHaveLength(1);
      expect(response.body.data.redeemed).toHaveLength(1);
    });
  });

  describe('GET /api/v1/gift-cards/balance/:code', () => {
    it('should get full gift card details for owner', async () => {
      // Create gift card with transactions
      const giftCard = await prisma.giftCard.create({
        data: {
          code: 'WITH-TRANSACTIONS-1234',
          balance: 300,
          initialBalance: 500,
          purchasedBy: userId,
          isActive: true,
        },
      });

      await prisma.giftCardTransaction.create({
        data: {
          giftCardId: giftCard.id,
          type: 'PARTIAL_USE',
          amount: 200,
          description: 'Used for order',
        },
      });

      const response = await request(app)
        .get(`/api/v1/gift-cards/balance/${giftCard.code}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.balance).toBe(300);
      expect(response.body.data.transactions).toHaveLength(1);
    });

    it('should reject access for non-owner non-redeemer', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'user9999999997@frames41.test',
          passwordHash: 'test-hash-not-real',
          phone: '9999999997',
          name: 'Other User',
          role: 'USER',
        },
      });

      // Create gift card owned by other user
      const giftCard = await prisma.giftCard.create({
        data: {
          code: 'PRIVATE-1234',
          balance: 500,
          initialBalance: 500,
          purchasedBy: otherUser.id,
          isActive: true,
        },
      });

      const response = await request(app)
        .get(`/api/v1/gift-cards/balance/${giftCard.code}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
