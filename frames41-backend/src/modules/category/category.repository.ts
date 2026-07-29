import type { Category, PrismaClient } from '@prisma/client';
import type { ICategoryRepository, CategoryWithChildren } from './category.types.js';

/**
 * Category repository implementation
 */
export class CategoryRepository implements ICategoryRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(includeInactive = false, onlyWithProducts = false): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        ...(includeInactive
          ? {}
          : {
              OR: [
                { isActive: true },
                { products: { some: { isActive: true } } },
              ],
            }),
        ...(onlyWithProducts ? { products: { some: { isActive: true } } } : {}),
      },
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findRoots(includeInactive = false): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        parentId: null,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findChildren(parentId: string, includeInactive = false): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        parentId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async create(data: {
    slug: string;
    name: string;
    description?: string;
    parentId?: string | null;
    mdfShape?: string;
    sortOrder: number;
    image?: string | null;
    isActive: boolean;
  }): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  /**
   * Build category tree recursively
   */
  async buildCategoryTree(includeInactive = false, onlyWithProducts = false): Promise<CategoryWithChildren[]> {
    const allCategories = await this.findAll(includeInactive, onlyWithProducts);
    const categoryMap = new Map<string, CategoryWithChildren>();
    const roots: CategoryWithChildren[] = [];

    // Initialize all categories with empty children array
    for (const category of allCategories) {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    }

    // Build tree structure
    for (const category of allCategories) {
      const node = categoryMap.get(category.id)!;
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
