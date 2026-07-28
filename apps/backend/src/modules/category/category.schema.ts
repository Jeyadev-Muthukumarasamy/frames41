import { z } from 'zod';

/**
 * Slug validation schema
 */
const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug too long')
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only');

/**
 * Create category schema
 */
export const createCategorySchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().uuid().nullish(),
  mdfShape: z.string().max(50).optional(),
  sortOrder: z.number().int().min(0).default(0),
  image: z.union([z.literal(''), z.string().url()]).optional(),
  imageUrl: z.union([z.literal(''), z.string().url()]).optional(),
  isActive: z.boolean().default(true),
});

/**
 * Update category schema
 */
export const updateCategorySchema = createCategorySchema.partial();

/**
 * Category ID param schema
 */
export const categoryIdParamSchema = z.object({
  id: z.string().uuid('Invalid category ID'),
});

/**
 * Category slug param schema
 */
export const categorySlugParamSchema = z.object({
  slug: slugSchema,
});

/**
 * Category query schema
 */
export const categoryQuerySchema = z.object({
  parentId: z.string().uuid().optional(),
  includeInactive: z.enum(['true', 'false']).optional().default('false'),
  onlyWithProducts: z.enum(['true', 'false']).optional().default('false'),
}).optional();

/**
 * Type exports
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
export type CategorySlugParam = z.infer<typeof categorySlugParamSchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
