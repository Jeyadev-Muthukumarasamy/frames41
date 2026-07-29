import { z } from 'zod';

export const createBulkOrderSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20),
  company: z.string().trim().max(150).optional(),
  quantity: z.number().int().min(10).max(1000000),
  message: z.string().trim().max(2000).optional(),
});

export type CreateBulkOrderInput = z.infer<typeof createBulkOrderSchema>;
