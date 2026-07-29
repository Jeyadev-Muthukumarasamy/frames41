import { z } from 'zod';

/**
 * Decimal validation (price)
 */
const decimalSchema = z.union([
  z.number().min(0),
  z.string().regex(/^\d+(\.\d{1,2})?$/),
]).transform((val) => (typeof val === 'string' ? parseFloat(val) : val));

/**
 * Slug validation
 */
const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only');

/**
 * Product image schema
 */
const productImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

/**
 * Product variant schema
 */
const productVariantSchema = z.object({
  name: z.string().min(1),
  priceModifier: decimalSchema.default(0),
  stock: z.number().int().min(0).default(0),
  attributes: z.record(z.string()).optional(),
  sku: z.string().min(1),
});

/**
 * Product price tier schema
 */
const priceTierSchema = z.object({
  minQty: z.number().int().min(1),
  pricePerUnit: decimalSchema,
});

const customizationToggleSchema = z.object({ enabled: z.boolean() });
const customizationCountSchema = customizationToggleSchema.extend({
  count: z.number().int().min(1).max(20),
});
const productCustomizationConfigSchema = z.object({
  numberOfImages: customizationCountSchema.optional(),
  numberOfNames: customizationCountSchema.optional(),
  date: customizationToggleSchema.optional(),
  songName: customizationToggleSchema.optional(),
  qrCodeImages: customizationCountSchema.optional(),
  contactShop: customizationToggleSchema.extend({
    value: z.string().max(300).optional(),
  }).optional(),
  startingFrom: customizationToggleSchema.extend({
    amount: decimalSchema.optional(),
  }).optional(),
}).optional();

/**
 * Create product schema
 */
export const createProductSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  basePrice: decimalSchema,
  discountedPrice: decimalSchema.optional(),
  sku: z.string().min(1).max(50),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isBestSeller: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().uuid(),
  fontOptions: z.array(z.string()).optional(),
  customizationConfig: productCustomizationConfigSchema,
  specifications: z.record(z.union([z.string(), z.number()])).optional(),
  careInstructions: z.string().max(5000).optional(),
  weight: decimalSchema.optional(),
  dimensions: z.object({
    length: decimalSchema,
    width: decimalSchema,
    height: decimalSchema,
  }).optional(),
  metaTitle: z.string().max(100).optional(),
  metaDescription: z.string().max(200).optional(),
  images: z.array(productImageSchema).min(1, 'At least one image is required'),
  variants: z.array(productVariantSchema).optional(),
  priceTiers: z.array(priceTierSchema).optional(),
});

/**
 * Update product schema
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Product ID param schema
 */
export const productIdParamSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
});

/**
 * Product slug param schema
 */
export const productSlugParamSchema = z.object({
  slug: slugSchema,
});

/**
 * Product query schema (for filtering)
 */
export const productQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  categoryId: z.string().uuid().optional(),
  categoryIds: z.string().transform((value) => value.split(',')).pipe(
    z.array(z.string().uuid()).max(20),
  ).optional(),
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
  inStock: z.enum(['true', 'false']).optional(),
  q: z.string().trim().min(2).max(100).optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'popularity', 'name-asc', 'featured', 'rating-desc']).default('newest'),
  includeInactive: z.enum(['true', 'false']).optional().default('false'),
});

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100),
  cursor: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
});

/**
 * Under price param schema
 */
export const underPriceParamSchema = z.object({
  amount: z.string().regex(/^\d+$/).transform(Number),
});

/**
 * Type exports
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
export type ProductSlugParam = z.infer<typeof productSlugParamSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type UnderPriceParam = z.infer<typeof underPriceParamSchema>;
