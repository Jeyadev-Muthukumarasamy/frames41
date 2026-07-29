import { z } from 'zod';

/**
 * Slug validation
 */
const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only');

/**
 * Create blog post schema
 */
export const createBlogPostSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  author: z.string().min(1).max(100),
  publishedAt: z.string().datetime().optional(),
  isPublished: z.boolean().default(false),
  metaTitle: z.string().max(100).optional(),
  metaDescription: z.string().max(200).optional(),
});

/**
 * Update blog post schema
 */
export const updateBlogPostSchema = createBlogPostSchema.partial();

/**
 * Blog post ID param schema
 */
export const blogPostIdParamSchema = z.object({
  id: z.string().uuid('Invalid blog post ID'),
});

/**
 * Blog post slug param schema
 */
export const blogPostSlugParamSchema = z.object({
  slug: slugSchema,
});

/**
 * Blog query schema
 */
export const blogQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  includeUnpublished: z.enum(['true', 'false']).optional().default('false'),
}).optional();

/**
 * Type exports
 */
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type BlogPostIdParam = z.infer<typeof blogPostIdParamSchema>;
export type BlogPostSlugParam = z.infer<typeof blogPostSlugParamSchema>;
export type BlogQuery = z.infer<typeof blogQuerySchema>;
