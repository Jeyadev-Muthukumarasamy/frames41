import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { createLRUCache } from '../../infrastructure/cache/lru.cache.js';

const homeCache = createLRUCache<string, {}>({ max: 1, ttl: 30_000 });

const productListInclude = {
  images: {
    take: 1,
    orderBy: { sortOrder: 'asc' as const },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
} as const;

const categoryProductInclude = {
  images: {
    take: 1,
    orderBy: { sortOrder: 'asc' as const },
  },
  variants: {
    where: { isActive: true },
    take: 1,
    select: { id: true },
  },
} as const;

export default function createHomeRoutes(): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const cached = homeCache.get('home');
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.status(200).json({ success: true, data: cached });
        return;
      }

      const now = new Date();
      const [categories, budgetProducts, bestsellers, newCollections, banners] =
        await Promise.all([
          prisma.category.findMany({
            // Imported products can belong to category records that are not marked
            // active yet. The homepage must follow the product catalogue's actual
            // category assignments or valid categories silently disappear.
            where: {
              products: {
                some: { isActive: true },
              },
            },
            orderBy: { sortOrder: 'asc' },
            include: {
              products: {
                where: { isActive: true },
                take: 4,
                orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
                include: categoryProductInclude,
              },
            },
          }),
          prisma.product.findMany({
            where: { isActive: true, basePrice: { lte: 999 } },
            take: 8,
            orderBy: { basePrice: 'asc' },
            include: productListInclude,
          }),
          prisma.product.findMany({
            where: { isActive: true },
            take: 6,
            orderBy: [{ isBestSeller: 'desc' }, { createdAt: 'desc' }],
            include: productListInclude,
          }),
          prisma.product.findMany({
            where: { isActive: true },
            take: 8,
            orderBy: { createdAt: 'desc' },
            include: productListInclude,
          }),
          prisma.banner.findMany({
            where: {
              type: 'HEADER_SLIDER',
              isActive: true,
              AND: [
                { OR: [{ startDate: null }, { startDate: { lte: now } }] },
                { OR: [{ endDate: null }, { endDate: { gte: now } }] },
              ],
            },
            orderBy: { sortOrder: 'asc' },
          }),
        ]);

      const data = {
        categories,
        budgetProducts,
        bestsellers,
        newCollections,
        heroBanners: banners.map((banner: {
          image: string;
          mobileImage: string | null;
          [key: string]: unknown;
        }) => ({
          ...banner,
          imageUrl: banner.image,
          mobileImageUrl: banner.mobileImage ?? undefined,
        })),
      };
      homeCache.set('home', data);
      res.setHeader('X-Cache', 'MISS');
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
