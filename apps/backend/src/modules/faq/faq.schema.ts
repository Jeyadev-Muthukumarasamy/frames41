import { z } from 'zod';

/**
 * Create FAQ schema
 */
export const createFAQSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  answer: z.string().min(10, 'Answer must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

/**
 * Update FAQ schema
 */
export const updateFAQSchema = createFAQSchema.partial();

/**
 * FAQ ID param schema
 */
export const faqIdParamSchema = z.object({
  id: z.string().uuid('Invalid FAQ ID'),
});

/**
 * FAQ category param schema
 */
export const faqCategoryParamSchema = z.object({
  category: z.string().min(1),
});

/**
 * FAQ query schema
 */
export const faqQuerySchema = z.object({
  category: z.string().optional(),
  includeInactive: z.enum(['true', 'false']).optional().default('false'),
}).optional();

/**
 * Type exports
 */
export type CreateFAQInput = z.infer<typeof createFAQSchema>;
export type UpdateFAQInput = z.infer<typeof updateFAQSchema>;
export type FAQIdParam = z.infer<typeof faqIdParamSchema>;
export type FAQCategoryParam = z.infer<typeof faqCategoryParamSchema>;
export type FAQQuery = z.infer<typeof faqQuerySchema>;
