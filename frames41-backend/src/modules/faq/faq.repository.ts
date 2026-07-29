import type { FAQ, PrismaClient } from '@prisma/client';
import type { IFAQRepository } from './faq.types.js';

/**
 * FAQ repository implementation
 */
export class FAQRepository implements IFAQRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(category?: string, includeInactive = false): Promise<FAQ[]> {
    return this.prisma.fAQ.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findById(id: string): Promise<FAQ | null> {
    return this.prisma.fAQ.findUnique({
      where: { id },
    });
  }

  async findByCategory(category: string, includeInactive = false): Promise<FAQ[]> {
    return this.prisma.fAQ.findMany({
      where: {
        category,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCategories(): Promise<string[]> {
    const result = await this.prisma.fAQ.groupBy({
      by: ['category'],
      where: { isActive: true },
    });
    return result.map((r) => r.category).sort();
  }

  async create(data: {
    question: string;
    answer: string;
    category: string;
    sortOrder: number;
    isActive: boolean;
  }): Promise<FAQ> {
    return this.prisma.fAQ.create({ data });
  }

  async update(id: string, data: Partial<FAQ>): Promise<FAQ> {
    return this.prisma.fAQ.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.fAQ.delete({
      where: { id },
    });
  }
}
