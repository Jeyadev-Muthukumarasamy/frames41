import type { Banner } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import type { IBannerRepository, IBannerService } from './banner.types.js';
import type { BannerType } from './banner.schema.js';

/**
 * Banner service implementation
 */
export class BannerService implements IBannerService {
  private readonly repository: IBannerRepository;

  constructor(repository: IBannerRepository) {
    this.repository = repository;
  }

  async getBanners(type?: BannerType, includeInactive = false): Promise<Banner[]> {
    return this.repository.findAll(type, includeInactive);
  }

  async getActiveBannersByType(type: BannerType): Promise<Banner[]> {
    return this.repository.findActiveByType(type);
  }

  async getBannerById(id: string): Promise<Banner> {
    const banner = await this.repository.findById(id);

    if (!banner) {
      throw new NotFoundError('Banner');
    }

    return banner;
  }

  async createBanner(data: {
    image: string;
    mobileImage?: string;
    link?: string;
    title?: string;
    subtitle?: string;
    sortOrder?: number;
    isActive?: boolean;
    type?: BannerType;
    startDate?: string;
    endDate?: string;
  }): Promise<Banner> {
    const banner = await this.repository.create({
      image: data.image,
      ...(data.mobileImage ? { mobileImage: data.mobileImage } : {}),
      ...(data.link ? { link: data.link } : {}),
      ...(data.title ? { title: data.title } : {}),
      ...(data.subtitle ? { subtitle: data.subtitle } : {}),
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
      type: data.type ?? 'HEADER_SLIDER',
      ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
      ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
    });

    logger.info({ bannerId: banner.id }, 'Banner created');
    return banner;
  }

  async updateBanner(
    id: string,
    data: Partial<{
      image: string;
      mobileImage: string;
      link: string;
      title: string;
      subtitle: string;
      sortOrder: number;
      isActive: boolean;
      type: BannerType;
      startDate: string;
      endDate: string;
    }>,
  ): Promise<Banner> {
    // Check if banner exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Banner');
    }

    const updateData: Partial<Banner> = {};
    
    if (data.image !== undefined) updateData.image = data.image;
    if (data.mobileImage !== undefined) updateData.mobileImage = data.mobileImage;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);

    const banner = await this.repository.update(id, updateData);
    logger.info({ bannerId: id }, 'Banner updated');
    return banner;
  }

  async deleteBanner(id: string): Promise<void> {
    // Check if banner exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Banner');
    }

    await this.repository.delete(id);
    logger.info({ bannerId: id }, 'Banner deleted');
  }
}
