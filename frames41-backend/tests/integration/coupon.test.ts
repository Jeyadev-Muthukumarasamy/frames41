import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';

describe('Coupon checkout integration', () => {
  const app = createApp();
  let token: string;
  let userId: string;
  let addressId: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: `coupon-${Date.now()}@frames41.test`,
        passwordHash: 'test-hash-not-real',
        phone: `8${Date.now().toString().slice(-9)}`,
        name: 'Coupon Customer',
      },
    });
    userId = user.id;
    token = jwt.sign(
      { userId, role: user.role, type: 'access' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' },
    );

    const address = await prisma.address.create({
      data: {
        userId,
        line1: '41 Test Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
      },
    });
    addressId = address.id;

    const category = await prisma.category.create({
      data: { slug: `coupon-category-${Date.now()}`, name: 'Coupon category' },
    });
    const product = await prisma.product.create({
      data: {
        categoryId: category.id,
        slug: `coupon-product-${Date.now()}`,
        name: 'Coupon product',
        description: 'Coupon integration test product',
        basePrice: 1000,
        sku: `COUPON-${Date.now()}`,
        stock: 10,
      },
    });
    await prisma.cart.create({
      data: {
        userId,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            unitPrice: 1000,
            totalPrice: 1000,
          },
        },
      },
    });
  });

  it('previews, applies, persists, and redeems a valid coupon', async () => {
    const coupon = await prisma.coupon.create({
      data: {
        code: 'SAVE20',
        type: 'PERCENT',
        value: 20,
        minOrderValue: 500,
        maxDiscount: 150,
        usageLimit: 10,
        perUserLimit: 1,
        validFrom: new Date(Date.now() - 60_000),
        validTo: new Date(Date.now() + 60_000),
      },
    });

    const preview = await request(app)
      .post('/api/v1/cart/calculate')
      .set('Authorization', `Bearer ${token}`)
      .send({ couponCode: ' save20 ' });

    expect(preview.status).toBe(200);
    expect(preview.body.data).toMatchObject({
      couponCode: 'SAVE20',
      subtotal: 1000,
      couponDiscount: 150,
      total: 850,
    });

    const placed = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ addressId, couponCode: 'save20' });

    expect(placed.status).toBe(201);
    expect(placed.body.data).toMatchObject({
      subtotal: 1000,
      discount: 150,
      total: 850,
      couponCode: 'SAVE20',
    });

    const redemption = await prisma.couponRedemption.findFirst({
      where: { couponId: coupon.id, userId },
    });
    expect(redemption?.orderId).toBe(placed.body.data.id);
    expect(await prisma.cartItem.count({ where: { cart: { userId } } })).toBe(0);
  });

  it('rejects an expired coupon during preview', async () => {
    await prisma.coupon.create({
      data: {
        code: 'EXPIRED',
        type: 'FLAT',
        value: 100,
        validFrom: new Date(Date.now() - 120_000),
        validTo: new Date(Date.now() - 60_000),
      },
    });

    const response = await request(app)
      .post('/api/v1/cart/calculate')
      .set('Authorization', `Bearer ${token}`)
      .send({ couponCode: 'EXPIRED' });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('Coupon has expired');
  });
});
