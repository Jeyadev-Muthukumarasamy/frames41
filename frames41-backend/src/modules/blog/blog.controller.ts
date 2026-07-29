import type { Request, Response, NextFunction } from 'express';
import type { IBlogService } from './blog.types.js';
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  blogPostIdParamSchema,
  blogPostSlugParamSchema,
  blogQuerySchema,
} from './blog.schema.js';

/**
 * Blog controller
 */
export class BlogController {
  private readonly blogService: IBlogService;

  constructor(blogService: IBlogService) {
    this.blogService = blogService;
  }

  /**
   * GET /blog
   * Get all blog posts
   */
  getBlogPosts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = blogQuerySchema.parse(req.query);
      const includeUnpublished = query?.includeUnpublished === 'true' && req.user?.role === 'ADMIN';

      const result = await this.blogService.getBlogPosts(
        includeUnpublished,
        query?.cursor,
        query?.limit,
      );

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
          pagination: {
            cursor: query?.cursor || null,
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
            limit: query?.limit || 10,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /blog/:id
   * Get blog post by ID
   */
  getBlogPostById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = blogPostIdParamSchema.parse(req.params);
      const post = await this.blogService.getBlogPostById(id);

      res.status(200).json({
        success: true,
        data: post,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /blog/by-slug/:slug
   * Get blog post by slug
   */
  getBlogPostBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slug } = blogPostSlugParamSchema.parse(req.params);
      const post = await this.blogService.getBlogPostBySlug(slug);

      res.status(200).json({
        success: true,
        data: post,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /blog
   * Create blog post (Admin only)
   */
  createBlogPost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = createBlogPostSchema.parse(req.body);
      const post = await this.blogService.createBlogPost(data);

      res.status(201).json({
        success: true,
        data: post,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /blog/:id
   * Update blog post (Admin only)
   */
  updateBlogPost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = blogPostIdParamSchema.parse(req.params);
      const data = updateBlogPostSchema.parse(req.body);
      const post = await this.blogService.updateBlogPost(id, data);

      res.status(200).json({
        success: true,
        data: post,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /blog/:id
   * Delete blog post (Admin only)
   */
  deleteBlogPost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = blogPostIdParamSchema.parse(req.params);
      await this.blogService.deleteBlogPost(id);

      res.status(200).json({
        success: true,
        data: { message: 'Blog post deleted successfully' },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
