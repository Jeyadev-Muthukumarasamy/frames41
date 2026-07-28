import type { Product, Prisma, PrismaClient } from '@prisma/client';
import { PAGINATION } from '../../config/constants.js';
import type {
  IProductRepository,
  ProductWithRelations,
  ProductFilters,
  ProductSortOption,
  CreateProductData,
  UpdateProductData,
} from './product.types.js';
import type { PaginationParams, PaginatedResult } from '../../shared/types/index.js';
import { createLRUCache } from '../../infrastructure/cache/lru.cache.js';

const productCatalogCache = createLRUCache<string, {}>({
  max: 500,
  ttl: 30_000,
});

/**
 * Product repository implementation
 */
export class ProductRepository implements IProductRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private get includeRelations() {
    return {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      },
      priceTiers: {
        orderBy: { minQty: 'asc' },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    } as const;
  }

  private get listRelations() {
    return {
      images: {
        take: 1,
        orderBy: { sortOrder: 'asc' as const },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    } as const;
  }

  async findAll(
    filters: ProductFilters,
    sort: ProductSortOption,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ProductWithRelations>> {
    const cacheKey = `list:${JSON.stringify({ filters, sort, pagination })}`;
    const cached = productCatalogCache.get(cacheKey);
    if (cached) return cached as PaginatedResult<ProductWithRelations>;

    const limit = Math.min(pagination.limit, PAGINATION.MAX_PAGE_SIZE);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    } else if (filters.categoryIds?.length) {
      where.categoryId = { in: filters.categoryIds };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isBestSeller !== undefined) {
      where.isBestSeller = filters.isBestSeller;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.basePrice = {};
      if (filters.minPrice !== undefined) {
        (where.basePrice as Record<string, unknown>).gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        (where.basePrice as Record<string, unknown>).lte = filters.maxPrice;
      }
    }

    if (filters.inStock) {
      where.stock = { gt: 0 };
    }

    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { shortDescription: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // Build order by
    let orderBy: Record<string, string | Record<string, string>>[] | Record<string, string> = {};
    switch (sort) {
      case 'price-asc':
        orderBy = { basePrice: 'asc' };
        break;
      case 'price-desc':
        orderBy = { basePrice: 'desc' };
        break;
      case 'popularity':
        orderBy = { isBestSeller: 'desc' };
        break;
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'featured':
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'rating-desc':
        // TODO: sort by average review rating once a computed field or raw query is added
        orderBy = { createdAt: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const products = await this.prisma.product.findMany({
      where,
      cursor: pagination.cursor ? { id: pagination.cursor } : undefined,
      skip: pagination.cursor ? 1 : 0,
      take: limit + 1, // Take one extra to check if there's more
      orderBy,
      include: this.listRelations,
    });

    const hasMore = products.length > limit;
    const data = hasMore ? products.slice(0, limit) : products;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    const result = {
      data: data as ProductWithRelations[],
      nextCursor,
      hasMore,
    };
    productCatalogCache.set(cacheKey, result);
    return result;
  }

  async findById(id: string): Promise<ProductWithRelations | null> {
    const cacheKey = `id:${id}`;
    const cached = productCatalogCache.get(cacheKey);
    if (cached) return cached as ProductWithRelations;
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.includeRelations,
    }) as ProductWithRelations | null;
    if (product) productCatalogCache.set(cacheKey, product);
    return product;
  }

  async findBySlug(slug: string): Promise<ProductWithRelations | null> {
    const cacheKey = `slug:${slug}`;
    const cached = productCatalogCache.get(cacheKey);
    if (cached) return cached as ProductWithRelations;
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: this.includeRelations,
    }) as ProductWithRelations | null;
    if (product) productCatalogCache.set(cacheKey, product);
    return product;
  }

  async search(
    query: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ProductWithRelations>> {
    const cacheKey = `search:${JSON.stringify({ query, pagination })}`;
    const cached = productCatalogCache.get(cacheKey);
    if (cached) return cached as PaginatedResult<ProductWithRelations>;
    const limit = Math.min(pagination.limit, PAGINATION.MAX_PAGE_SIZE);

    // Split query into words for broader matching
    const words = query.trim().split(/\s+/).filter((w) => w.length > 0);

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          // Match any word in the name
          ...words.map((word) => ({
            name: { contains: word, mode: 'insensitive' as const },
          })),
          // Match any word in the description
          ...words.map((word) => ({
            description: { contains: word, mode: 'insensitive' as const },
          })),
          // Match any word in the short description
          ...words.map((word) => ({
            shortDescription: { contains: word, mode: 'insensitive' as const },
          })),
        ],
      },
      cursor: pagination.cursor ? { id: pagination.cursor } : undefined,
      skip: pagination.cursor ? 1 : 0,
      take: limit + 1,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: this.listRelations,
    });

    const hasMore = products.length > limit;
    const data = hasMore ? products.slice(0, limit) : products;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    const result = {
      data: data as ProductWithRelations[],
      nextCursor,
      hasMore,
    };
    productCatalogCache.set(cacheKey, result);
    return result;
  }

  async findUnderPrice(
    amount: number,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ProductWithRelations>> {
    const cacheKey = `under:${JSON.stringify({ amount, pagination })}`;
    const cached = productCatalogCache.get(cacheKey);
    if (cached) return cached as PaginatedResult<ProductWithRelations>;
    const limit = Math.min(pagination.limit, PAGINATION.MAX_PAGE_SIZE);

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        basePrice: { lte: amount },
      },
      cursor: pagination.cursor ? { id: pagination.cursor } : undefined,
      skip: pagination.cursor ? 1 : 0,
      take: limit + 1,
      orderBy: { basePrice: 'asc' },
      include: this.listRelations,
    });

    const hasMore = products.length > limit;
    const data = hasMore ? products.slice(0, limit) : products;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    const result = {
      data: data as ProductWithRelations[],
      nextCursor,
      hasMore,
    };
    productCatalogCache.set(cacheKey, result);
    return result;
  }

  async create(data: CreateProductData): Promise<ProductWithRelations> {
    const product = await this.prisma.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        basePrice: data.basePrice,
        discountedPrice: data.discountedPrice,
        sku: data.sku,
        stock: data.stock,
        isActive: data.isActive,
        isBestSeller: data.isBestSeller,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId,
        fontOptions: data.fontOptions,
        customizationConfig: data.customizationConfig as Prisma.InputJsonValue | undefined,
        specifications: data.specifications,
        careInstructions: data.careInstructions,
        weight: data.weight,
        dimensions: data.dimensions,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        images: {
          create: data.images,
        },
        variants: data.variants?.length
          ? { create: data.variants }
          : undefined,
        priceTiers: data.priceTiers?.length
          ? { create: data.priceTiers }
          : undefined,
      },
      include: this.includeRelations,
    });

    productCatalogCache.clear();
    return product as ProductWithRelations;
  }

  async update(id: string, data: UpdateProductData): Promise<ProductWithRelations> {
    const updateData: Record<string, unknown> = {};

    // Simple fields
    const simpleFields = [
      'slug', 'name', 'description', 'shortDescription', 'basePrice',
      'discountedPrice', 'sku', 'stock', 'isActive', 'isBestSeller',
      'isFeatured', 'categoryId', 'fontOptions', 'customizationConfig', 'specifications', 'careInstructions',
      'weight', 'dimensions', 'metaTitle', 'metaDescription',
    ];

    for (const field of simpleFields) {
      if (field in data) {
        updateData[field] = data[field as keyof UpdateProductData];
      }
    }

    // Handle images update (delete and recreate)
    if (data.images) {
      await this.prisma.productImage.deleteMany({
        where: { productId: id },
      });
      updateData.images = {
        create: data.images,
      };
    }

    // Handle variants update
    if (data.variants) {
      await this.prisma.productVariant.deleteMany({
        where: { productId: id },
      });
      updateData.variants = {
        create: data.variants,
      };
    }

    // Handle price tiers update
    if (data.priceTiers) {
      await this.prisma.productPriceTier.deleteMany({
        where: { productId: id },
      });
      updateData.priceTiers = {
        create: data.priceTiers,
      };
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: this.includeRelations,
    });

    productCatalogCache.clear();
    return product as ProductWithRelations;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
    productCatalogCache.clear();
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: {
        slug: { equals: slug, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: {
        sku: { equals: sku, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async variantSkuExists(skus: string[], excludeProductId?: string): Promise<string[]> {
    const existing = await this.prisma.productVariant.findMany({
      where: {
        sku: { in: skus, mode: 'insensitive' },
        ...(excludeProductId ? { productId: { not: excludeProductId } } : {}),
      },
      select: { sku: true },
    });
    return existing.map((v) => v.sku);
  }
}
