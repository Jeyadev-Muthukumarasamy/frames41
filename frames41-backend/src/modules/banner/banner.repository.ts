import type { Banner, PrismaClient } from '@prisma/client';
import type { BannerType } from './banner.schema.js';
import type { IBannerRepository } from './banner.types.js';

/**
 * Banner repository implementation
 */
export class BannerRepository implements IBannerRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(type?: BannerType, includeInactive = false): Promise<Banner[]> {
    return this.prisma.banner.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findActiveByType(type: BannerType): Promise<Banner[]> {
    const now = new Date();
    
    return this.prisma.banner.findMany({
      where: {
        type,
        isActive: true,
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string): Promise<Banner | null> {
    return this.prisma.banner.findUnique({
      where: { id },
    });
  }

  async create(data: {
    image: string;
    mobileImage?: string;
    link?: string;
    title?: string;
    subtitle?: string;
    sortOrder: number;
    isActive: boolean;
    type: BannerType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Banner> {
    return this.prisma.banner.create({ data });
  }

  async update(id: string, data: Partial<Banner>): Promise<Banner> {
    return this.prisma.banner.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.banner.delete({
      where: { id },
    });
  }
}
