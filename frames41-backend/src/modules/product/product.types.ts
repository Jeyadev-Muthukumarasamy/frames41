import type { Product, ProductImage, ProductVariant, ProductPriceTier, Prisma } from '@prisma/client';
import type { PaginatedResult, PaginationParams } from '../../shared/types/index.js';

export interface ProductCustomizationConfig {
  numberOfImages?: { enabled: boolean; count: number };
  numberOfNames?: { enabled: boolean; count: number };
  date?: { enabled: boolean };
  songName?: { enabled: boolean };
  qrCodeImages?: { enabled: boolean; count: number };
  contactShop?: { enabled: boolean; value?: string };
  startingFrom?: { enabled: boolean; amount?: number };
}

/**
 * Product with relations
 */
export interface ProductWithRelations extends Product {
  images: ProductImage[];
  variants: ProductVariant[];
  priceTiers: ProductPriceTier[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Product filter options
 */
export interface ProductFilters {
  categoryId?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  query?: string;
  isActive?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
}

/**
 * Product sort options
 */
export type ProductSortOption = 'newest' | 'price-asc' | 'price-desc' | 'popularity' | 'name-asc' | 'featured' | 'rating-desc';

/**
 * Product repository interface
 */
export interface IProductRepository {
  /**
   * Find all products with pagination
   */
  findAll(
    filters: ProductFilters,
    sort: ProductSortOption,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ProductWithRelations>>;

  /**
   * Find product by ID
   */
  findById(id: string): Promise<ProductWithRelations | null>;

  /**
   * Find product by slug
   */
  findBySlug(slug: string): Promise<ProductWithRelations | null>;

  /**
   * Search products using pg_trgm
   */
  search(
    query: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ProductWithRelations>>;

  /**
   * Find products under specific price
   */
  findUnderPrice(
    amount: number,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ProductWithRelations>>;

  /**
   * Create product with relations
   */
  create(data: CreateProductData): Promise<ProductWithRelations>;

  /**
   * Update product
   */
  update(id: string, data: UpdateProductData): Promise<ProductWithRelations>;

  /**
   * Delete product
   */
  delete(id: string): Promise<void>;

  /**
   * Check if slug exists
   */
  slugExists(slug: string, excludeId?: string): Promise<boolean>;

  /**
   * Check if SKU exists
   */
  skuExists(sku: string, excludeId?: string): Promise<boolean>;

  /**
   * Check if any variant SKU already exists globally
   */
  variantSkuExists(skus: string[], excludeProductId?: string): Promise<string[]>;
}

/**
 * Create product data
 */
export interface CreateProductData {
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  discountedPrice?: number;
  sku: string;
  stock: number;
  isActive: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  categoryId: string;
  fontOptions?: string[];
  customizationConfig?: ProductCustomizationConfig;
  specifications?: Record<string, string | number>;
  careInstructions?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  metaTitle?: string;
  metaDescription?: string;
  images: Array<{
    url: string;
    alt?: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  variants?: Array<{
    name: string;
    priceModifier: number;
    stock: number;
    attributes?: Record<string, string>;
    sku: string;
  }>;
  priceTiers?: Array<{
    minQty: number;
    pricePerUnit: number;
  }>;
}

/**
 * Update product data
 */
export type UpdateProductData = Partial<CreateProductData>;

/**
 * Product service interface
 */
export interface IProductService {
  /**
   * Get products with filtering and pagination
   */
  getProducts(
    filters: ProductFilters,
    sort: ProductSortOption,
    cursor?: string,
    limit?: number,
  ): Promise<PaginatedResult<ProductWithRelations>>;

  /**
   * Get product by ID
   */
  getProductById(id: string): Promise<ProductWithRelations>;

  /**
   * Get product by slug
   */
  getProductBySlug(slug: string): Promise<ProductWithRelations>;

  /**
   * Search products
   */
  searchProducts(
    query: string,
    cursor?: string,
    limit?: number,
  ): Promise<PaginatedResult<ProductWithRelations>>;

  /**
   * Get products under price
   */
  getProductsUnderPrice(
    amount: number,
    cursor?: string,
    limit?: number,
  ): Promise<PaginatedResult<ProductWithRelations>>;

  /**
   * Create product
   */
  createProduct(data: CreateProductData): Promise<ProductWithRelations>;

  /**
   * Update product
   */
  updateProduct(id: string, data: UpdateProductData): Promise<ProductWithRelations>;

  /**
   * Delete product
   */
  deleteProduct(id: string): Promise<void>;
}
