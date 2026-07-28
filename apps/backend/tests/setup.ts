import { config } from 'dotenv';
import { prisma } from './../src/infrastructure/database/prisma.client.js';
import { clearAllCaches } from './../src/infrastructure/cache/lru.cache.js';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-at-least-32-characters';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-at-least-32-characters';

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

// Clean up after each test
afterEach(async () => {
  clearAllCaches();
  // Phase 6: Content
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.blogPost.deleteMany();
  // Gift card transactions (FK to giftCard)
  await prisma.giftCardTransaction.deleteMany();
  // Phase 4: Order children (FK to order via Cascade)
  await prisma.referralRedemption.deleteMany();
  await prisma.refundRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  // Phase 3: Commerce (user/product linked)
  await prisma.couponRedemption.deleteMany();
  await prisma.abandonedCartTrigger.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.referralCode.deleteMany();
  await prisma.giftCard.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.shippingRate.deleteMany();
  await prisma.pincodeServiceability.deleteMany();
  // Phase 2: Catalog (children before parents)
  await prisma.productPriceTier.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.category.deleteMany();
  // Phase 1: Core
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.idempotencyKey.deleteMany();
  await prisma.user.deleteMany();
});

// Global teardown
afterAll(async () => {
  await prisma.$disconnect();
});
