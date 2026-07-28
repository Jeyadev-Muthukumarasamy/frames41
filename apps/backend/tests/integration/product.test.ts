import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.client.js';

describe('Product Integration Tests', () => {
  const app = createApp();
  let adminToken: string;
  let categoryId: string;

  beforeEach(async () => {
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({ where: { phone: '9876543210' } });

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

    // Create a category for products
    const category = await prisma.category.create({
      data: {
        slug: 'test-category',
        name: 'Test Category',
        isActive: true,
      },
    });
    categoryId = category.id;
  });

  afterEach(async () => {
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({ where: { phone: '9876543210' } });
  });

  describe('GET /api/v1/products', () => {
    it('should return empty products list', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.pagination.hasMore).toBe(false);
    });

    it('should return products with pagination', async () => {
      // Create test products
      await prisma.product.create({
        data: {
          slug: 'product-1',
          name: 'Product 1',
          description: 'Description 1',
          basePrice: 99.99,
          sku: 'SKU-001',
          stock: 10,
          isActive: true,
          categoryId,
          images: {
            create: {
              url: 'https://example.com/image1.jpg',
              isPrimary: true,
              sortOrder: 0,
            },
          },
        },
      });

      await prisma.product.create({
        data: {
          slug: 'product-2',
          name: 'Product 2',
          description: 'Description 2',
          basePrice: 149.99,
          sku: 'SKU-002',
          stock: 5,
          isActive: true,
          categoryId,
          images: {
            create: {
              url: 'https://example.com/image2.jpg',
              isPrimary: true,
              sortOrder: 0,
            },
          },
        },
      });

      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.pagination).toBeDefined();
      expect(response.body.meta.pagination.limit).toBe(20);
    });

    it('should filter by category', async () => {
      const otherCategory = await prisma.category.create({
        data: {
          slug: 'other-category',
          name: 'Other Category',
          isActive: true,
        },
      });

      await prisma.product.create({
        data: {
          slug: 'product-cat1',
          name: 'Product Cat1',
          description: 'Description',
          basePrice: 99.99,
          sku: 'SKU-CAT1',
          stock: 10,
          isActive: true,
          categoryId,
          images: {
            create: {
              url: 'https://example.com/image.jpg',
              isPrimary: true,
              sortOrder: 0,
            },
          },
        },
      });

      await prisma.product.create({
        data: {
          slug: 'product-other',
          name: 'Product Other',
          description: 'Description',
          basePrice: 99.99,
          sku: 'SKU-OTHER',
          stock: 10,
          isActive: true,
          categoryId: otherCategory.id,
          images: {
            create: {
              url: 'https://example.com/image2.jpg',
              isPrimary: true,
              sortOrder: 0,
            },
          },
        },
      });

      const response = await request(app)
        .get(`/api/v1/products?categoryId=${categoryId}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].slug).toBe('product-cat1');
    });

    it('should filter by price range', async () => {
      await prisma.product.create({
        data: {
          slug: 'cheap-product',
          name: 'Cheap Product',
          description: 'Description',
          basePrice: 50.00,
          sku: 'SKU-CHEAP',
          stock: 10,
          isActive: true,
          categoryId,
          images: {
            create: {
              url: 'https://example.com/image.jpg',
              isPrimary: true,
              sortOrder: 0,
            },
          },
        },
      });

      await prisma.product.create({
        data: {
          slug: 'expensive-product',
          name: 'Expensive Product',
          description: 'Description',
          basePrice: 500.00,
          sku: 'SKU-EXPENSIVE',
          stock: 10,
          isActive: true,
          categoryId,
          images: {
            create: {
              url: 'https://example.com/image2.jpg',
              isPrimary: true,
              sortOrder: 0,
            },
          },
        },
      });

      const response = await request(app)
        .get('/api/v1/products?minPrice=100&maxPrice=600')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].slug).toBe('expensive-product');
    });

    it('should sort by price ascending', async () => {
      await prisma.product.create({
        data: {
          slug: 'product-c',
          name: 'Product C',
          description: 'Description',
          basePrice: 300.00,
          sku: 'SKU-C',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/c.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      await prisma.product.create({
        data: {
          slug: 'product-a',
          name: 'Product A',
          description: 'Description',
          basePrice: 100.00,
          sku: 'SKU-A',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/a.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      await prisma.product.create({
        data: {
          slug: 'product-b',
          name: 'Product B',
          description: 'Description',
          basePrice: 200.00,
          sku: 'SKU-B',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/b.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      const response = await request(app)
        .get('/api/v1/products?sort=price-asc')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].slug).toBe('product-a');
      expect(response.body.data[1].slug).toBe('product-b');
      expect(response.body.data[2].slug).toBe('product-c');
    });

    it('should not include inactive products for public', async () => {
      await prisma.product.create({
        data: {
          slug: 'active-product',
          name: 'Active Product',
          description: 'Description',
          basePrice: 99.99,
          sku: 'SKU-ACTIVE',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/active.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      await prisma.product.create({
        data: {
          slug: 'inactive-product',
          name: 'Inactive Product',
          description: 'Description',
          basePrice: 99.99,
          sku: 'SKU-INACTIVE',
          stock: 10,
          isActive: false,
          categoryId,
          images: { create: { url: 'https://example.com/inactive.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].slug).toBe('active-product');
    });
  });

  describe('GET /api/v1/products/search', () => {
    it('should search products by name', async () => {
      await prisma.product.create({
        data: {
          slug: 'wooden-frame',
          name: 'Wooden Photo Frame',
          description: 'Beautiful wooden frame',
          basePrice: 199.99,
          sku: 'SKU-WOOD',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/wood.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      await prisma.product.create({
        data: {
          slug: 'metal-frame',
          name: 'Metal Wall Frame',
          description: 'Metal frame description',
          basePrice: 299.99,
          sku: 'SKU-METAL',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/metal.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      const response = await request(app)
        .get('/api/v1/products/search?q=wooden')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Wooden Photo Frame');
    });

    it('should search products by description', async () => {
      await prisma.product.create({
        data: {
          slug: 'custom-product',
          name: 'Custom Product',
          description: 'Handcrafted with love',
          basePrice: 99.99,
          sku: 'SKU-CUSTOM',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/custom.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      const response = await request(app)
        .get('/api/v1/products/search?q=handcrafted')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].slug).toBe('custom-product');
    });

    it('should reject search with less than 2 characters', async () => {
      const response = await request(app)
        .get('/api/v1/products/search?q=a')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('GET /api/v1/products/under-price/:amount', () => {
    it('should return products under specified price', async () => {
      await prisma.product.create({
        data: {
          slug: 'under-99',
          name: 'Under 99 Product',
          description: 'Description',
          basePrice: 79.99,
          sku: 'SKU-UNDER99',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/under99.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      await prisma.product.create({
        data: {
          slug: 'over-99',
          name: 'Over 99 Product',
          description: 'Description',
          basePrice: 150.00,
          sku: 'SKU-OVER99',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/over99.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      const response = await request(app)
        .get('/api/v1/products/under-price/99')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].slug).toBe('under-99');
    });

    it('should reject invalid amount', async () => {
      const response = await request(app)
        .get('/api/v1/products/under-price/-10')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should get product by ID with all relations', async () => {
      const product = await prisma.product.create({
        data: {
          slug: 'detailed-product',
          name: 'Detailed Product',
          description: 'Detailed description',
          basePrice: 199.99,
          discountedPrice: 149.99,
          sku: 'SKU-DETAIL',
          stock: 10,
          isActive: true,
          isBestSeller: true,
          categoryId,
          fontOptions: ['Arial', 'Times New Roman'],
          specifications: { material: 'Wood', size: '10x10' },
          weight: 0.5,
          dimensions: { length: 10, width: 10, height: 2 },
          images: {
            create: [
              { url: 'https://example.com/primary.jpg', isPrimary: true, sortOrder: 0 },
              { url: 'https://example.com/hover.jpg', isPrimary: false, sortOrder: 1 },
            ],
          },
          variants: {
            create: [
              { name: 'Small', priceModifier: 0, stock: 5, sku: 'SKU-DETAIL-S', attributes: { size: 'S' } },
              { name: 'Large', priceModifier: 50, stock: 3, sku: 'SKU-DETAIL-L', attributes: { size: 'L' } },
            ],
          },
          priceTiers: {
            create: [
              { minQty: 10, pricePerUnit: 180.00 },
              { minQty: 50, pricePerUnit: 160.00 },
            ],
          },
        },
      });

      const response = await request(app)
        .get(`/api/v1/products/${product.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(product.id);
      expect(response.body.data.name).toBe('Detailed Product');
      expect(response.body.data.images).toHaveLength(2);
      expect(response.body.data.variants).toHaveLength(2);
      expect(response.body.data.priceTiers).toHaveLength(2);
      expect(response.body.data.category).toBeDefined();
      expect(response.body.data.specifications).toEqual({ material: 'Wood', size: '10x10' });
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/v1/products/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/v1/products/by-slug/:slug', () => {
    it('should get product by slug', async () => {
      await prisma.product.create({
        data: {
          slug: 'my-awesome-product',
          name: 'My Awesome Product',
          description: 'Description',
          basePrice: 99.99,
          sku: 'SKU-AWESOME',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/awesome.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      const response = await request(app)
        .get('/api/v1/products/by-slug/my-awesome-product')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe('my-awesome-product');
      expect(response.body.data.name).toBe('My Awesome Product');
    });
  });

  describe('POST /api/v1/products (Admin only)', () => {
    it('should create product with all relations', async () => {
      const productData = {
        slug: 'new-product',
        name: 'New Product',
        description: 'Product description',
        shortDescription: 'Short description',
        basePrice: 199.99,
        discountedPrice: 149.99,
        sku: 'NEW-SKU-001',
        stock: 100,
        isActive: true,
        isBestSeller: false,
        categoryId,
        fontOptions: ['Arial', 'Roboto'],
        specifications: { material: 'MDF', thickness: '3mm' },
        weight: 0.3,
        dimensions: { length: 20, width: 15, height: 0.3 },
        metaTitle: 'New Product Meta Title',
        metaDescription: 'New Product Meta Description',
        images: [
          { url: 'https://example.com/image1.jpg', alt: 'Image 1', isPrimary: true, sortOrder: 0 },
          { url: 'https://example.com/image2.jpg', alt: 'Image 2', isPrimary: false, sortOrder: 1 },
        ],
        variants: [
          { name: 'Red', priceModifier: 0, stock: 50, sku: 'NEW-SKU-001-RED', attributes: { color: 'red' } },
          { name: 'Blue', priceModifier: 10, stock: 50, sku: 'NEW-SKU-001-BLUE', attributes: { color: 'blue' } },
        ],
        priceTiers: [
          { minQty: 10, pricePerUnit: 180.00 },
          { minQty: 25, pricePerUnit: 160.00 },
        ],
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe('new-product');
      expect(response.body.data.images).toHaveLength(2);
      expect(response.body.data.variants).toHaveLength(2);
      expect(response.body.data.priceTiers).toHaveLength(2);
    });

    it('should reject duplicate slug', async () => {
      await prisma.product.create({
        data: {
          slug: 'existing-product',
          name: 'Existing Product',
          description: 'Description',
          basePrice: 99.99,
          sku: 'EXISTING-SKU',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/existing.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'existing-product',
          name: 'New Product',
          description: 'Description',
          basePrice: 99.99,
          sku: 'NEW-SKU',
          stock: 10,
          isActive: true,
          categoryId,
          images: [{ url: 'https://example.com/image.jpg', isPrimary: true, sortOrder: 0 }],
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should reject duplicate SKU', async () => {
      await prisma.product.create({
        data: {
          slug: 'product-one',
          name: 'Product One',
          description: 'Description',
          basePrice: 99.99,
          sku: 'UNIQUE-SKU',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/one.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'product-two',
          name: 'Product Two',
          description: 'Description',
          basePrice: 99.99,
          sku: 'UNIQUE-SKU',
          stock: 10,
          isActive: true,
          categoryId,
          images: [{ url: 'https://example.com/two.jpg', isPrimary: true, sortOrder: 0 }],
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should reject invalid category ID', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'orphan-product',
          name: 'Orphan Product',
          description: 'Description',
          basePrice: 99.99,
          sku: 'ORPHAN-SKU',
          stock: 10,
          isActive: true,
          categoryId: '00000000-0000-0000-0000-000000000000',
          images: [{ url: 'https://example.com/orphan.jpg', isPrimary: true, sortOrder: 0 }],
        })
        .expect(400); // Category not found

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/products/:id (Admin only)', () => {
    it('should update product successfully', async () => {
      const product = await prisma.product.create({
        data: {
          slug: 'update-test',
          name: 'Original Name',
          description: 'Original description',
          basePrice: 99.99,
          sku: 'UPDATE-SKU',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/original.jpg', isPrimary: true, sortOrder: 0 } },
        },
      });

      const response = await request(app)
        .patch(`/api/v1/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
          basePrice: 149.99,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.basePrice).toBe(149.99);
      expect(response.body.data.slug).toBe('update-test');
    });

    it('should replace images when updating', async () => {
      const product = await prisma.product.create({
        data: {
          slug: 'image-update-test',
          name: 'Image Update Test',
          description: 'Description',
          basePrice: 99.99,
          sku: 'IMG-UPDATE-SKU',
          stock: 10,
          isActive: true,
          categoryId,
          images: {
            create: [
              { url: 'https://example.com/old1.jpg', isPrimary: true, sortOrder: 0 },
              { url: 'https://example.com/old2.jpg', isPrimary: false, sortOrder: 1 },
            ],
          },
        },
      });

      const response = await request(app)
        .patch(`/api/v1/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          images: [
            { url: 'https://example.com/new1.jpg', isPrimary: true, sortOrder: 0 },
          ],
        })
        .expect(200);

      expect(response.body.data.images).toHaveLength(1);
      expect(response.body.data.images[0].url).toBe('https://example.com/new1.jpg');
    });
  });

  describe('DELETE /api/v1/products/:id (Admin only)', () => {
    it('should delete product and all relations', async () => {
      const product = await prisma.product.create({
        data: {
          slug: 'delete-test',
          name: 'Delete Test',
          description: 'Description',
          basePrice: 99.99,
          sku: 'DELETE-SKU',
          stock: 10,
          isActive: true,
          categoryId,
          images: { create: { url: 'https://example.com/delete.jpg', isPrimary: true, sortOrder: 0 } },
          variants: { create: { name: 'Variant', priceModifier: 0, stock: 5, sku: 'DELETE-VAR' } },
          priceTiers: { create: { minQty: 10, pricePerUnit: 90.00 } },
        },
      });

      const response = await request(app)
        .delete(`/api/v1/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Product deleted successfully');

      const deleted = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/v1/products/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
