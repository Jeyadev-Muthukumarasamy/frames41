import type { BlogPost } from '@prisma/client';
import type { PaginatedResult, PaginationParams } from '../../shared/types/index.js';

/**
 * Blog post repository interface
 */
export interface IBlogRepository {
  /**
   * Find all published blog posts
   */
  findAll(
    includeUnpublished: boolean,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<BlogPost>>;

  /**
   * Find blog post by ID
   */
  findById(id: string): Promise<BlogPost | null>;

  /**
   * Find blog post by slug
   */
  findBySlug(slug: string): Promise<BlogPost | null>;

  /**
   * Create blog post
   */
  create(data: {
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
  }): Promise<BlogPost>;

  /**
   * Update blog post
   */
  update(id: string, data: Partial<BlogPost>): Promise<BlogPost>;

  /**
   * Delete blog post
   */
  delete(id: string): Promise<void>;

  /**
   * Check if slug exists
   */
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
}

/**
 * Blog service interface
 */
export interface IBlogService {
  /**
   * Get all blog posts
   */
  getBlogPosts(
    includeUnpublished: boolean,
    cursor?: string,
    limit?: number,
  ): Promise<PaginatedResult<BlogPost>>;

  /**
   * Get blog post by ID
   */
  getBlogPostById(id: string): Promise<BlogPost>;

  /**
   * Get blog post by slug
   */
  getBlogPostBySlug(slug: string): Promise<BlogPost>;

  /**
   * Create blog post
   */
  createBlogPost(data: {
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    author: string;
    publishedAt?: string;
    isPublished?: boolean;
    metaTitle?: string;
    metaDescription?: string;
  }): Promise<BlogPost>;

  /**
   * Update blog post
   */
  updateBlogPost(
    id: string,
    data: Partial<{
      slug: string;
      title: string;
      content: string;
      excerpt: string;
      coverImage: string;
      author: string;
      publishedAt: string;
      isPublished: boolean;
      metaTitle: string;
      metaDescription: string;
    }>,
  ): Promise<BlogPost>;

  /**
   * Delete blog post
   */
  deleteBlogPost(id: string): Promise<void>;
}
