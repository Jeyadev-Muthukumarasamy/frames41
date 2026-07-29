import type { Request, Response, NextFunction } from 'express';
import type { Banner } from '@prisma/client';
import type { IBannerService } from './banner.types.js';
import {
  createBannerSchema,
  updateBannerSchema,
  bannerIdParamSchema,
  bannerTypeQuerySchema,
} from './banner.schema.js';
import type { BannerType } from './banner.schema.js';

/**
 * Banner controller
 */
export class BannerController {
  private readonly bannerService: IBannerService;

  constructor(bannerService: IBannerService) {
    this.bannerService = bannerService;
  }

  /**
   * Normalize banner for API response (adds imageUrl / mobileImageUrl aliases)
   */
  private normalizeBannerResponse(banner: Banner) {
    return {
      ...banner,
      imageUrl: banner.image,
      mobileImageUrl: banner.mobileImage ?? undefined,
    };
  }

  /**
   * GET /banners
   * Get all banners
   */
  getBanners = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = bannerTypeQuerySchema.parse(req.query);
      const includeInactive = query?.includeInactive === 'true' && req.user?.role === 'ADMIN';
      
      const banners = await this.bannerService.getBanners(
        query?.type as BannerType,
        includeInactive,
      );

      res.status(200).json({
        success: true,
        data: banners.map((b) => this.normalizeBannerResponse(b)),
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /banners/by-type/:type
   * Get active banners by type
   */
  getBannersByType = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { type } = req.params;
      const banners = await this.bannerService.getActiveBannersByType(type as BannerType);

      res.status(200).json({
        success: true,
        data: banners.map((b) => this.normalizeBannerResponse(b)),
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /banners/:id
   * Get banner by ID
   */
  getBannerById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = bannerIdParamSchema.parse(req.params);
      const banner = await this.bannerService.getBannerById(id);

      res.status(200).json({
        success: true,
        data: this.normalizeBannerResponse(banner),
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /banners
   * Create banner (Admin only)
   */
  createBanner = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = createBannerSchema.parse(req.body);
      const createData: Parameters<IBannerService['createBanner']>[0] = {
        image: (parsed.image || parsed.imageUrl)!,
        sortOrder: parsed.sortOrder,
        isActive: parsed.isActive,
        type: parsed.type,
      };
      if (parsed.mobileImage || parsed.mobileImageUrl) {
        createData.mobileImage = (parsed.mobileImage || parsed.mobileImageUrl)!;
      }
      if (parsed.link) {
        createData.link = parsed.link;
      }
      if (parsed.title) {
        createData.title = parsed.title;
      }
      if (parsed.subtitle) {
        createData.subtitle = parsed.subtitle;
      }
      if (parsed.startDate) {
        createData.startDate = parsed.startDate;
      }
      if (parsed.endDate) {
        createData.endDate = parsed.endDate;
      }
      const banner = await this.bannerService.createBanner(createData);

      res.status(201).json({
        success: true,
        data: this.normalizeBannerResponse(banner),
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /banners/:id
   * Update banner (Admin only)
   */
  updateBanner = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = bannerIdParamSchema.parse(req.params);
      const parsed = updateBannerSchema.parse(req.body);
      const updateData: Parameters<IBannerService['updateBanner']>[1] = {};
      if (parsed.image !== undefined || parsed.imageUrl !== undefined) {
        updateData.image = (parsed.image || parsed.imageUrl)!;
      }
      if (parsed.mobileImage !== undefined || parsed.mobileImageUrl !== undefined) {
        updateData.mobileImage = (parsed.mobileImage || parsed.mobileImageUrl)!;
      }
      if (parsed.link !== undefined && parsed.link !== '') {
        updateData.link = parsed.link;
      }
      if (parsed.title !== undefined && parsed.title !== '') {
        updateData.title = parsed.title;
      }
      if (parsed.subtitle !== undefined && parsed.subtitle !== '') {
        updateData.subtitle = parsed.subtitle;
      }
      if (parsed.sortOrder !== undefined) {
        updateData.sortOrder = parsed.sortOrder;
      }
      if (parsed.isActive !== undefined) {
        updateData.isActive = parsed.isActive;
      }
      if (parsed.type !== undefined) {
        updateData.type = parsed.type;
      }
      if (parsed.startDate !== undefined && parsed.startDate !== '') {
        updateData.startDate = parsed.startDate;
      }
      if (parsed.endDate !== undefined && parsed.endDate !== '') {
        updateData.endDate = parsed.endDate;
      }
      const banner = await this.bannerService.updateBanner(id, updateData);

      res.status(200).json({
        success: true,
        data: this.normalizeBannerResponse(banner),
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /banners/:id
   * Delete banner (Admin only)
   */
  deleteBanner = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = bannerIdParamSchema.parse(req.params);
      await this.bannerService.deleteBanner(id);

      res.status(200).json({
        success: true,
        data: { message: 'Banner deleted successfully' },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
