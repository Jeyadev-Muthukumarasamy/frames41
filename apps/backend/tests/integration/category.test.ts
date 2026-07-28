import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';

describe('Category Integration Tests', () => {
  const app = createApp();
  let adminToken: string;
  let userToken: string;
  let adminId: string;

  beforeEach(async () => {
    await prisma.category.deleteMany({});
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
    adminId = admin.id;

    // Generate tokens
    adminToken = jwt.sign(
      { userId: admin.id, role: 'ADMIN', type: 'access' },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' },
    );

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
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({ where: { phone: { in: ['9876543210', '9876543211'] } } });
  });

  describe('GET /api/v1/categories/tree', () => {
    it('should return empty tree when no categories exist', async () => {
      const response = await request(app)
        .get('/api/v1/categories/tree')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return category tree with nested children', async () => {
      // Create parent category
      const parent = await prisma.category.create({
        data: {
          slug: 'mdf-cutouts',
          name: 'MDF Cutouts',
          description: 'MDF cutout products',
          sortOrder: 1,
          isActive: true,
        },
      });

      // Create child category
      await prisma.category.create({
        data: {
          slug: 'wall-hanging',
          name: 'Wall Hanging',
          description: 'Wall hanging cutouts',
          parentId: parent.id,
          mdfShape: 'circle',
          sortOrder: 1,
          isActive: true,
        },
      });

      const response = await request(app)
        .get('/api/v1/categories/tree')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].slug).toBe('mdf-cutouts');
      expect(response.body.data[0].children).toHaveLength(1);
      expect(response.body.data[0].children[0].slug).toBe('wall-hanging');
    });

    it('should not include inactive categories for public users', async () => {
      await prisma.category.create({
        data: {
          slug: 'active-category',
          name: 'Active Category',
          isActive: true,
        },
      });

      await prisma.category.create({
        data: {
          slug: 'inactive-category',
          name: 'Inactive Category',
          isActive: false,
        },
      });

      const response = await request(app)
        .get('/api/v1/categories/tree')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].slug).toBe('active-category');
    });

    it('should include inactive categories for admin with query param', async () => {
      await prisma.category.create({
        data: {
          slug: 'inactive-category',
          name: 'Inactive Category',
          isActive: false,
        },
      });

      const response = await request(app)
        .get('/api/v1/categories/tree?includeInactive=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].slug).toBe('inactive-category');
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should get category by ID', async () => {
      const category = await prisma.category.create({
        data: {
          slug: 'test-category',
          name: 'Test Category',
          description: 'Test description',
          isActive: true,
        },
      });

      const response = await request(app)
        .get(`/api/v1/categories/${category.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(category.id);
      expect(response.body.data.name).toBe('Test Category');
      expect(response.body.data.slug).toBe('test-category');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/v1/categories/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid category ID', async () => {
      const response = await request(app)
        .get('/api/v1/categories/invalid-id')
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/categories/by-slug/:slug', () => {
    it('should get category by slug', async () => {
      const category = await prisma.category.create({
        data: {
          slug: 'diy-kits',
          name: 'DIY Kits',
          isActive: true,
        },
      });

      const response = await request(app)
        .get('/api/v1/categories/by-slug/diy-kits')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(category.id);
      expect(response.body.data.name).toBe('DIY Kits');
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app)
        .get('/api/v1/categories/by-slug/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/v1/categories (Admin only)', () => {
    it('should create category successfully', async () => {
      const categoryData = {
        slug: 'new-category',
        name: 'New Category',
        description: 'New category description',
        sortOrder: 1,
        isActive: true,
      };

      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe('new-category');
      expect(response.body.data.name).toBe('New Category');
    });

    it('should reject duplicate slug', async () => {
      await prisma.category.create({
        data: {
          slug: 'duplicate-slug',
          name: 'First Category',
          isActive: true,
        },
      });

      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'duplicate-slug',
          name: 'Second Category',
          isActive: true,
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should reject invalid slug format', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'Invalid Slug With Spaces',
          name: 'Test Category',
          isActive: true,
        })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject non-admin user', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          slug: 'test-category',
          name: 'Test Category',
          isActive: true,
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .send({
          slug: 'test-category',
          name: 'Test Category',
          isActive: true,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should create nested category with parent', async () => {
      const parent = await prisma.category.create({
        data: {
          slug: 'parent-category',
          name: 'Parent Category',
          isActive: true,
        },
      });

      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'child-category',
          name: 'Child Category',
          parentId: parent.id,
          isActive: true,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.parentId).toBe(parent.id);
    });

    it('should reject category with non-existent parent', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'orphan-category',
          name: 'Orphan Category',
          parentId: '00000000-0000-0000-0000-000000000000',
          isActive: true,
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/categories/:id (Admin only)', () => {
    it('should update category successfully', async () => {
      const category = await prisma.category.create({
        data: {
          slug: 'update-test',
          name: 'Original Name',
          isActive: true,
        },
      });

      const response = await request(app)
        .patch(`/api/v1/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.slug).toBe('update-test');
    });

    it('should reject update with duplicate slug', async () => {
      await prisma.category.create({
        data: {
          slug: 'existing-slug',
          name: 'Existing Category',
          isActive: true,
        },
      });

      const category = await prisma.category.create({
        data: {
          slug: 'another-slug',
          name: 'Another Category',
          isActive: true,
        },
      });

      const response = await request(app)
        .patch(`/api/v1/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ slug: 'existing-slug' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should reject circular parent reference', async () => {
      const category = await prisma.category.create({
        data: {
          slug: 'self-parent',
          name: 'Self Parent',
          isActive: true,
        },
      });

      const response = await request(app)
        .patch(`/api/v1/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ parentId: category.id })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('DELETE /api/v1/categories/:id (Admin only)', () => {
    it('should delete category successfully', async () => {
      const category = await prisma.category.create({
        data: {
          slug: 'delete-test',
          name: 'Delete Test',
          isActive: true,
        },
      });

      const response = await request(app)
        .delete(`/api/v1/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Category deleted successfully');

      const deleted = await prisma.category.findUnique({
        where: { id: category.id },
      });
      expect(deleted).toBeNull();
    });

    it('should reject deletion of category with children', async () => {
      const parent = await prisma.category.create({
        data: {
          slug: 'parent-with-children',
          name: 'Parent with Children',
          isActive: true,
        },
      });

      await prisma.category.create({
        data: {
          slug: 'child-category',
          name: 'Child Category',
          parentId: parent.id,
          isActive: true,
        },
      });

      const response = await request(app)
        .delete(`/api/v1/categories/${parent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .delete('/api/v1/categories/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
