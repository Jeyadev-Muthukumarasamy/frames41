import type { Category } from '@prisma/client';

/**
 * Category with nested children
 */
export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

/**
 * Category repository interface
 */
export interface ICategoryRepository {
  /**
   * Find all categories
   */
  findAll(includeInactive?: boolean, onlyWithProducts?: boolean): Promise<Category[]>;

  /**
   * Find category by ID
   */
  findById(id: string): Promise<Category | null>;

  /**
   * Find category by slug
   */
  findBySlug(slug: string): Promise<Category | null>;

  /**
   * Find root categories (no parent)
   */
  findRoots(includeInactive?: boolean): Promise<Category[]>;

  /**
   * Find children of a category
   */
  findChildren(parentId: string, includeInactive?: boolean): Promise<Category[]>;

  /**
   * Create category
   */
  create(data: {
    slug: string;
    name: string;
    description?: string;
    parentId?: string | null;
    mdfShape?: string;
    sortOrder: number;
    image?: string | null;
    isActive: boolean;
  }): Promise<Category>;

  /**
   * Update category
   */
  update(id: string, data: Partial<Category>): Promise<Category>;

  /**
   * Delete category
   */
  delete(id: string): Promise<void>;

  /**
   * Check if slug exists
   */
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
}

/**
 * Category service interface
 */
export interface ICategoryService {
  /**
   * Get all categories as tree
   */
  getCategoryTree(includeInactive?: boolean, onlyWithProducts?: boolean): Promise<CategoryWithChildren[]>;

  /**
   * Get category by ID with children
   */
  getCategoryById(id: string): Promise<CategoryWithChildren>;

  /**
   * Get category by slug with children
   */
  getCategoryBySlug(slug: string): Promise<CategoryWithChildren>;

  /**
   * Create category
   */
  createCategory(data: {
    slug: string;
    name: string;
    description?: string;
    parentId?: string | null;
    mdfShape?: string;
    sortOrder?: number;
    image?: string | null;
    isActive?: boolean;
  }): Promise<Category>;

  /**
   * Update category
   */
  updateCategory(
    id: string,
    data: Partial<{
      slug: string;
      name: string;
      description: string;
      parentId: string | null;
      mdfShape: string;
      sortOrder: number;
      image: string | null;
      isActive: boolean;
    }>,
  ): Promise<Category>;

  /**
   * Delete category
   */
  deleteCategory(id: string): Promise<void>;
}
