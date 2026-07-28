import { z } from 'zod';

/**
 * Subscribe to newsletter schema
 */
export const subscribeNewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
});

/**
 * Unsubscribe from newsletter schema
 */
export const unsubscribeNewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Type exports
 */
export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>;
export type UnsubscribeNewsletterInput = z.infer<typeof unsubscribeNewsletterSchema>;
