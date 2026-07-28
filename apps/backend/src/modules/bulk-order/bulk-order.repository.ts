import type { PrismaClient } from '@prisma/client';
import type { CreateBulkOrderInput } from './bulk-order.schema.js';

export class BulkOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: CreateBulkOrderInput) {
    return this.prisma.bulkOrderRequest.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        company: data.company || null,
        quantity: data.quantity,
        message: data.message || null,
      },
    });
  }
}
