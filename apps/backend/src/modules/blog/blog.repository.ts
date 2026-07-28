import type { BlogPost, PrismaClient } from '@prisma/client';
import type { IBlogRepository } from './blog.types.js';
import type { PaginatedResult, PaginationParams } from '../../shared/types/index.js';
import { PAGINATION } from '../../config/constants.js';

/**
 * Blog repository implementation
 */
export class BlogRepository implements IBlogRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(
    includeUnpublished: boolean,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<BlogPost>> {
    const limit = Math.min(pagination.limit, PAGINATION.MAX_PAGE_SIZE);

    const cursorCondition = pagination.cursor
      ? { id: { gt: pagination.cursor } }
      : {};

    const where = includeUnpublished
      ? {}
      : { isPublished: true, publishedAt: { lte: new Date() } };

    const posts = await this.prisma.blogPost.findMany({
      where: {
        ...where,
        ...cursorCondition,
      },
      take: limit + 1,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return {
      data,
      nextCursor,
      hasMore,
    };
  }

  async findById(id: string): Promise<BlogPost | null> {
    return this.prisma.blogPost.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<BlogPost | null> {
    return this.prisma.blogPost.findUnique({
      where: { slug },
    });
  }

  async create(data: {
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    author: string;
    publishedAt?: Date;
    isPublished: boolean;
    metaTitle?: string;
    metaDescription?: string;
  }): Promise<BlogPost> {
    return this.prisma.blogPost.create({ data });
  }

  async update(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    return this.prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.blogPost.delete({
      where: { id },
    });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.blogPost.count({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }
}
