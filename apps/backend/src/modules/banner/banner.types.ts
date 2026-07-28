import type { Banner, PrismaClient } from '@prisma/client';
import type { BannerType } from './banner.schema.js';

/**
 * Banner repository interface
 */
export interface IBannerRepository {
  /**
   * Find all banners
   */
  findAll(type?: BannerType, includeInactive?: boolean): Promise<Banner[]>;

  /**
   * Find active banners by type
   */
  findActiveByType(type: BannerType): Promise<Banner[]>;

  /**
   * Find banner by ID
   */
  findById(id: string): Promise<Banner | null>;

  /**
   * Create banner
   */
  create(data: {
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
  }): Promise<Banner>;

  /**
   * Update banner
   */
  update(id: string, data: Partial<Banner>): Promise<Banner>;

  /**
   * Delete banner
   */
  delete(id: string): Promise<void>;
}

/**
 * Banner service interface
 */
export interface IBannerService {
  /**
   * Get all banners
   */
  getBanners(type?: BannerType, includeInactive?: boolean): Promise<Banner[]>;

  /**
   * Get active banners by type
   */
  getActiveBannersByType(type: BannerType): Promise<Banner[]>;

  /**
   * Get banner by ID
   */
  getBannerById(id: string): Promise<Banner>;

  /**
   * Create banner
   */
  createBanner(data: {
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
  }): Promise<Banner>;

  /**
   * Update banner
   */
  updateBanner(
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
  ): Promise<Banner>;

  /**
   * Delete banner
   */
  deleteBanner(id: string): Promise<void>;
}
