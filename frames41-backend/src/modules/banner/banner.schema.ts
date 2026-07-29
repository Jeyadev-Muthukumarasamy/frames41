import { z } from 'zod';

/**
 * Banner type enum
 */
export const bannerTypeSchema = z.enum(['TOP_STRIP', 'HEADER_SLIDER', 'UNDER_999', 'CATEGORY_BANNER', 'PROMOTIONAL']);

/**
 * Date string schema that accepts ISO datetime, YYYY-MM-DD, or empty string
 */
const dateStringSchema = z.union([
  z.literal(''),
  z.string().datetime(),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD or ISO datetime'),
]).optional();

/**
 * Base banner schema (shared between create and update)
 */
const baseBannerSchema = z.object({
  image: z.union([z.literal(''), z.string().url('Image must be a valid URL')]).optional(),
  imageUrl: z.union([z.literal(''), z.string().url()]).optional(),
  mobileImage: z.union([z.literal(''), z.string().url()]).optional(),
  mobileImageUrl: z.union([z.literal(''), z.string().url()]).optional(),
  link: z.union([z.literal(''), z.string().url()]).optional(),
  title: z.string().max(100).optional(),
  subtitle: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  type: bannerTypeSchema.default('HEADER_SLIDER'),
  startDate: dateStringSchema,
  endDate: dateStringSchema,
});

/**
 * Create banner schema
 */
export const createBannerSchema = baseBannerSchema.refine(
  (data) => !!(data.image || data.imageUrl),
  { message: 'Image is required', path: ['image'] },
);

/**
 * Update banner schema
 */
export const updateBannerSchema = baseBannerSchema.partial();

/**
 * Banner ID param schema
 */
export const bannerIdParamSchema = z.object({
  id: z.string().uuid('Invalid banner ID'),
});

/**
 * Banner type query schema
 */
export const bannerTypeQuerySchema = z.object({
  type: bannerTypeSchema.optional(),
  includeInactive: z.enum(['true', 'false']).optional().default('false'),
}).optional();

/**
 * Type exports
 */
export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
export type BannerIdParam = z.infer<typeof bannerIdParamSchema>;
export type BannerTypeQuery = z.infer<typeof bannerTypeQuerySchema>;
export type BannerType = z.infer<typeof bannerTypeSchema>;
