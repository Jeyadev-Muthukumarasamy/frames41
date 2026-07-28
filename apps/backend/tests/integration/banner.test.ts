import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';

describe('Banner Integration Tests', () => {
  const app = createApp();
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    await prisma.banner.deleteMany({});
    await prisma.user.deleteMany({ where: { phone: { in: ['9876543210', '9876543211'] } } });

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'user9876543210@frames41.test',
        passwordHash: 'test-hash-not-real',
        phone: '9876543210',
        name: 'Admin User',
        role: 'ADMIN',
      },
    });

    adminToken = jwt.sign(
      { userId: admin.id, role: 'ADMIN', type: 'access' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' },
    );

    // Create regular user
    const user = await prisma.user.create({
      data: {
        email: 'user9876543211@frames41.test',
        passwordHash: 'test-hash-not-real',
        phone: '9876543211',
        name: 'Regular User',
        role: 'USER',
      },
    });

    userToken = jwt.sign(
      { userId: user.id, role: 'USER', type: 'access' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' },
    );
  });

  afterEach(async () => {
    await prisma.banner.deleteMany({});
    await prisma.user.deleteMany({ where: { phone: { in: ['9876543210', '9876543211'] } } });
  });

  describe('GET /api/v1/banners', () => {
    it('should return empty banners list', async () => {
      const response = await request(app)
        .get('/api/v1/banners')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all active banners', async () => {
      await prisma.banner.create({
        data: {
          image: 'https://example.com/banner1.jpg',
          title: 'Active Banner 1',
          link: 'https://example.com/shop',
          sortOrder: 1,
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      await prisma.banner.create({
        data: {
          image: 'https://example.com/banner2.jpg',
          title: 'Active Banner 2',
          sortOrder: 2,
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      const response = await request(app)
        .get('/api/v1/banners')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should not include inactive banners for public users', async () => {
      await prisma.banner.create({
        data: {
          image: 'https://example.com/active.jpg',
          title: 'Active Banner',
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      await prisma.banner.create({
        data: {
          image: 'https://example.com/inactive.jpg',
          title: 'Inactive Banner',
          isActive: false,
          type: 'HEADER_SLIDER',
        },
      });

      const response = await request(app)
        .get('/api/v1/banners')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Active Banner');
    });

    it('should filter by banner type', async () => {
      await prisma.banner.create({
        data: {
          image: 'https://example.com/slider.jpg',
          title: 'Slider Banner',
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      await prisma.banner.create({
        data: {
          image: 'https://example.com/topstrip.jpg',
          title: 'Top Strip Banner',
          isActive: true,
          type: 'TOP_STRIP',
        },
      });

      const response = await request(app)
        .get('/api/v1/banners?type=TOP_STRIP')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('TOP_STRIP');
    });

    it('should include inactive for admin with query param', async () => {
      await prisma.banner.create({
        data: {
          image: 'https://example.com/inactive.jpg',
          title: 'Inactive Banner',
          isActive: false,
          type: 'HEADER_SLIDER',
        },
      });

      const response = await request(app)
        .get('/api/v1/banners?includeInactive=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isActive).toBe(false);
    });
  });

  describe('GET /api/v1/banners/by-type/:type', () => {
    it('should return active banners by type', async () => {
      await prisma.banner.create({
        data: {
          image: 'https://example.com/under999-1.jpg',
          title: 'Under 999 Deal 1',
          link: '/shop?maxPrice=999',
          sortOrder: 1,
          isActive: true,
          type: 'UNDER_999',
        },
      });

      await prisma.banner.create({
        data: {
          image: 'https://example.com/under999-2.jpg',
          title: 'Under 999 Deal 2',
          link: '/shop?maxPrice=999',
          sortOrder: 2,
          isActive: true,
          type: 'UNDER_999',
        },
      });

      await prisma.banner.create({
        data: {
          image: 'https://example.com/slider.jpg',
          title: 'Main Slider',
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      const response = await request(app)
        .get('/api/v1/banners/by-type/UNDER_999')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].type).toBe('UNDER_999');
      expect(response.body.data[1].type).toBe('UNDER_999');
    });

    it('should respect banner schedule dates', async () => {
      const now = new Date();
      const future = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      const past = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday

      await prisma.banner.create({
        data: {
          image: 'https://example.com/current.jpg',
          title: 'Current Banner',
          isActive: true,
          type: 'PROMOTIONAL',
          startDate: past,
          endDate: future,
        },
      });

      await prisma.banner.create({
        data: {
          image: 'https://example.com/future.jpg',
          title: 'Future Banner',
          isActive: true,
          type: 'PROMOTIONAL',
          startDate: future,
          endDate: new Date(future.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      const response = await request(app)
        .get('/api/v1/banners/by-type/PROMOTIONAL')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Current Banner');
    });
  });

  describe('GET /api/v1/banners/:id', () => {
    it('should get banner by ID', async () => {
      const banner = await prisma.banner.create({
        data: {
          image: 'https://example.com/banner.jpg',
          mobileImage: 'https://example.com/banner-mobile.jpg',
          title: 'Test Banner',
          subtitle: 'Banner Subtitle',
          link: 'https://example.com',
          sortOrder: 1,
          isActive: true,
          type: 'HEADER_SLIDER',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const response = await request(app)
        .get(`/api/v1/banners/${banner.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(banner.id);
      expect(response.body.data.title).toBe('Test Banner');
      expect(response.body.data.mobileImage).toBe('https://example.com/banner-mobile.jpg');
    });

    it('should return 404 for non-existent banner', async () => {
      const response = await request(app)
        .get('/api/v1/banners/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/v1/banners (Admin only)', () => {
    it('should create banner successfully', async () => {
      const bannerData = {
        image: 'https://example.com/new-banner.jpg',
        mobileImage: 'https://example.com/new-banner-mobile.jpg',
        title: 'New Banner',
        subtitle: 'Check out our new collection',
        link: 'https://example.com/new-collection',
        sortOrder: 1,
        isActive: true,
        type: 'HEADER_SLIDER',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bannerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.image).toBe('https://example.com/new-banner.jpg');
      expect(response.body.data.title).toBe('New Banner');
      expect(response.body.data.type).toBe('HEADER_SLIDER');
    });

    it('should create banner with minimal data', async () => {
      const response = await request(app)
        .post('/api/v1/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          image: 'https://example.com/simple-banner.jpg',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.image).toBe('https://example.com/simple-banner.jpg');
      expect(response.body.data.isActive).toBe(true);
      expect(response.body.data.type).toBe('HEADER_SLIDER');
      expect(response.body.data.sortOrder).toBe(0);
    });

    it('should reject invalid image URL', async () => {
      const response = await request(app)
        .post('/api/v1/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          image: 'not-a-valid-url',
        })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid banner type', async () => {
      const response = await request(app)
        .post('/api/v1/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          image: 'https://example.com/banner.jpg',
          type: 'INVALID_TYPE',
        })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject non-admin user', async () => {
      const response = await request(app)
        .post('/api/v1/banners')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          image: 'https://example.com/banner.jpg',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/v1/banners')
        .send({
          image: 'https://example.com/banner.jpg',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /api/v1/banners/:id (Admin only)', () => {
    it('should update banner successfully', async () => {
      const banner = await prisma.banner.create({
        data: {
          image: 'https://example.com/original.jpg',
          title: 'Original Title',
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      const response = await request(app)
        .patch(`/api/v1/banners/${banner.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
          link: 'https://example.com/updated',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.link).toBe('https://example.com/updated');
      expect(response.body.data.image).toBe('https://example.com/original.jpg');
    });

    it('should deactivate banner', async () => {
      const banner = await prisma.banner.create({
        data: {
          image: 'https://example.com/active.jpg',
          title: 'Active Banner',
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      const response = await request(app)
        .patch(`/api/v1/banners/${banner.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false,
        })
        .expect(200);

      expect(response.body.data.isActive).toBe(false);
    });

    it('should update banner schedule', async () => {
      const banner = await prisma.banner.create({
        data: {
          image: 'https://example.com/scheduled.jpg',
          title: 'Scheduled Banner',
          isActive: true,
          type: 'PROMOTIONAL',
        },
      });

      const newStartDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const newEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .patch(`/api/v1/banners/${banner.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          startDate: newStartDate,
          endDate: newEndDate,
        })
        .expect(200);

      expect(response.body.data.startDate).toBeDefined();
      expect(response.body.data.endDate).toBeDefined();
    });

    it('should return 404 for non-existent banner', async () => {
      const response = await request(app)
        .patch('/api/v1/banners/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/v1/banners/:id (Admin only)', () => {
    it('should delete banner successfully', async () => {
      const banner = await prisma.banner.create({
        data: {
          image: 'https://example.com/delete-me.jpg',
          title: 'Delete Me',
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      const response = await request(app)
        .delete(`/api/v1/banners/${banner.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Banner deleted successfully');

      const deleted = await prisma.banner.findUnique({
        where: { id: banner.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent banner', async () => {
      const response = await request(app)
        .delete('/api/v1/banners/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject non-admin user', async () => {
      const banner = await prisma.banner.create({
        data: {
          image: 'https://example.com/protected.jpg',
          title: 'Protected Banner',
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      const response = await request(app)
        .delete(`/api/v1/banners/${banner.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Banner sorting', () => {
    it('should return banners sorted by sortOrder', async () => {
      await prisma.banner.create({
        data: {
          image: 'https://example.com/third.jpg',
          title: 'Third Banner',
          sortOrder: 3,
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      await prisma.banner.create({
        data: {
          image: 'https://example.com/first.jpg',
          title: 'First Banner',
          sortOrder: 1,
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      await prisma.banner.create({
        data: {
          image: 'https://example.com/second.jpg',
          title: 'Second Banner',
          sortOrder: 2,
          isActive: true,
          type: 'HEADER_SLIDER',
        },
      });

      const response = await request(app)
        .get('/api/v1/banners/by-type/HEADER_SLIDER')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].title).toBe('First Banner');
      expect(response.body.data[1].title).toBe('Second Banner');
      expect(response.body.data[2].title).toBe('Third Banner');
    });
  });
});
