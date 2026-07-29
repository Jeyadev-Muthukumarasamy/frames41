import type { BlogPost } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import type { IBlogRepository, IBlogService } from './blog.types.js';
import type { PaginatedResult } from '../../shared/types/index.js';

/**
 * Blog service implementation
 */
export class BlogService implements IBlogService {
  private readonly repository: IBlogRepository;

  constructor(repository: IBlogRepository) {
    this.repository = repository;
  }

  async getBlogPosts(
    includeUnpublished: boolean,
    cursor?: string,
    limit: number = 10,
  ): Promise<PaginatedResult<BlogPost>> {
    return this.repository.findAll(includeUnpublished, { cursor, limit });
  }

  async getBlogPostById(id: string): Promise<BlogPost> {
    const post = await this.repository.findById(id);

    if (!post) {
      throw new NotFoundError('Blog post');
    }

    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost> {
    const post = await this.repository.findBySlug(slug);

    if (!post) {
      throw new NotFoundError('Blog post');
    }

    // Check if published
    if (!post.isPublished) {
      throw new NotFoundError('Blog post');
    }

    return post;
  }

  async createBlogPost(data: {
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
  }): Promise<BlogPost> {
    // Check slug uniqueness
    const slugExists = await this.repository.slugExists(data.slug);
    if (slugExists) {
      throw new ConflictError(`Blog post with slug "${data.slug}" already exists`);
    }

    const post = await this.repository.create({
      slug: data.slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      author: data.author,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      isPublished: data.isPublished ?? false,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    });

    logger.info({ postId: post.id }, 'Blog post created');
    return post;
  }

  async updateBlogPost(
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
  ): Promise<BlogPost> {
    // Check if post exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Blog post');
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await this.repository.slugExists(data.slug, id);
      if (slugExists) {
        throw new ConflictError(`Blog post with slug "${data.slug}" already exists`);
      }
    }

    const updateData: Partial<BlogPost> = {};
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.author !== undefined) updateData.author = data.author;
    if (data.publishedAt !== undefined) updateData.publishedAt = new Date(data.publishedAt);
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;

    const post = await this.repository.update(id, updateData);
    logger.info({ postId: id }, 'Blog post updated');
    return post;
  }

  async deleteBlogPost(id: string): Promise<void> {
    // Check if post exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Blog post');
    }

    await this.repository.delete(id);
    logger.info({ postId: id }, 'Blog post deleted');
  }
}
