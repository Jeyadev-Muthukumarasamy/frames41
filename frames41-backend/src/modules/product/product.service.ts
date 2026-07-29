import type { ProductWithRelations, ProductFilters, ProductSortOption, CreateProductData, UpdateProductData, IProductService } from './product.types.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import type { IProductRepository } from './product.types.js';
import type { PaginatedResult } from '../../shared/types/index.js';
import { PAGINATION } from '../../config/constants.js';

/**
 * Product service implementation
 */
export class ProductService implements IProductService {
  private readonly repository: IProductRepository;

  constructor(repository: IProductRepository) {
    this.repository = repository;
  }

  async getProducts(
    filters: ProductFilters,
    sort: ProductSortOption,
    cursor?: string,
    limit: number = PAGINATION.DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedResult<ProductWithRelations>> {
    return this.repository.findAll(
      filters,
      sort,
      { cursor, limit },
    );
  }

  async getProductById(id: string): Promise<ProductWithRelations> {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new NotFoundError('Product');
    }

    return product;
  }

  async getProductBySlug(slug: string): Promise<ProductWithRelations> {
    const product = await this.repository.findBySlug(slug);

    if (!product) {
      throw new NotFoundError('Product');
    }

    return product;
  }

  async searchProducts(
    query: string,
    cursor?: string,
    limit: number = PAGINATION.DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedResult<ProductWithRelations>> {
    // Sanitize search query
    const sanitizedQuery = query.trim().replace(/[<>]/g, '').slice(0, 100);
    
    if (sanitizedQuery.length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters');
    }

    return this.repository.search(sanitizedQuery, { cursor, limit });
  }

  async getProductsUnderPrice(
    amount: number,
    cursor?: string,
    limit: number = PAGINATION.DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedResult<ProductWithRelations>> {
    if (amount <= 0) {
      throw new BadRequestError('Amount must be greater than 0');
    }

    return this.repository.findUnderPrice(amount, { cursor, limit });
  }

  async createProduct(data: CreateProductData): Promise<ProductWithRelations> {
    // Validate slug uniqueness
    const slugExists = await this.repository.slugExists(data.slug);
    if (slugExists) {
      throw new ConflictError(`Product with slug "${data.slug}" already exists`);
    }

    // Validate SKU uniqueness
    const skuExists = await this.repository.skuExists(data.sku);
    if (skuExists) {
      throw new ConflictError(`Product with SKU "${data.sku}" already exists`);
    }

    // Validate variants have unique SKUs and don't conflict with existing variants
    if (data.variants && data.variants.length > 0) {
      const variantSkus = data.variants.map((v) => v.sku);
      const uniqueVariantSkus = new Set(variantSkus);
      if (variantSkus.length !== uniqueVariantSkus.size) {
        throw new ConflictError('Variant SKUs must be unique');
      }
      const conflicting = await this.repository.variantSkuExists(variantSkus);
      if (conflicting.length > 0) {
        throw new ConflictError(`Variant SKU(s) already exist: ${conflicting.join(', ')}`);
      }
    }

    const product = await this.repository.create(data);
    logger.info({ productId: product.id }, 'Product created');
    return product;
  }

  async updateProduct(
    id: string,
    data: UpdateProductData,
  ): Promise<ProductWithRelations> {
    // Check if product exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product');
    }

    // Validate slug uniqueness if changing
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await this.repository.slugExists(data.slug, id);
      if (slugExists) {
        throw new ConflictError(`Product with slug "${data.slug}" already exists`);
      }
    }

    // Validate SKU uniqueness if changing
    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await this.repository.skuExists(data.sku, id);
      if (skuExists) {
        throw new ConflictError(`Product with SKU "${data.sku}" already exists`);
      }
    }

    // Validate variant SKUs don't conflict with other products when updating
    if (data.variants && data.variants.length > 0) {
      const variantSkus = data.variants.map((v) => v.sku);
      const uniqueVariantSkus = new Set(variantSkus);
      if (variantSkus.length !== uniqueVariantSkus.size) {
        throw new ConflictError('Variant SKUs must be unique');
      }
      const conflicting = await this.repository.variantSkuExists(variantSkus, id);
      if (conflicting.length > 0) {
        throw new ConflictError(`Variant SKU(s) already exist: ${conflicting.join(', ')}`);
      }
    }

    const product = await this.repository.update(id, data);
    logger.info({ productId: id }, 'Product updated');
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    // Check if product exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product');
    }

    await this.repository.delete(id);
    logger.info({ productId: id }, 'Product deleted');
  }
}
