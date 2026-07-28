import { z } from 'zod';

/**
 * Indian phone number validation
 */
const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number');

/**
 * Pincode validation (6 digits)
 */
const pincodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Pincode must be 6 digits');

/**
 * User profile update schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email').optional().nullable(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().nullable(),
});

/**
 * Create address schema
 */
export const createAddressSchema = z.object({
  line1: z.string().min(5, 'Address line 1 is required').max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pincode: pincodeSchema,
  isDefault: z.boolean().default(false),
});

/**
 * Update address schema
 */
export const updateAddressSchema = createAddressSchema.partial();

/**
 * Address ID param schema
 */
export const addressIdParamSchema = z.object({
  id: z.string().uuid('Invalid address ID'),
});

/**
 * User response schema
 */
export const userResponseSchema = z.object({
  id: z.string(),
  phone: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  dob: z.string().nullable(),
  role: z.enum(['USER', 'ADMIN']),
  isVerified: z.boolean(),
  createdAt: z.string(),
  lastLoginAt: z.string().nullable(),
});

/**
 * Address response schema
 */
export const addressResponseSchema = z.object({
  id: z.string(),
  line1: z.string(),
  line2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
});

/**
 * Type exports
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type AddressIdParam = z.infer<typeof addressIdParamSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AddressResponse = z.infer<typeof addressResponseSchema>;
