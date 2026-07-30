import type { Request, Response } from 'express';
import { createLRUCache } from '../../infrastructure/cache/lru.cache.js';
import { PrismaClient } from '@prisma/client';

interface CachedImage {
  buffer: Buffer;
  contentType: string;
}

const imageBufferCache = createLRUCache<string, CachedImage>({
  max: 1000,
  ttl: 86_400_000, // 24 hours
});

const DEFAULT_SVG_FALLBACK = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#2d180e"/>
  <rect x="40" y="40" width="320" height="320" rx="16" fill="#3a2012" stroke="#d97706" stroke-width="3"/>
  <circle cx="200" cy="160" r="40" fill="#f59e0b" opacity="0.8"/>
  <path d="M100 280 L160 200 L220 280 L260 230 L300 280 Z" fill="#d97706"/>
  <text x="200" y="330" font-family="sans-serif" font-size="16" font-weight="bold" fill="#fef3c7" text-anchor="middle">Frames41 Photo Frame</text>
</svg>
`.trim();

export class ImageController {
  private isWarming = false;

  /**
   * Background image cache pre-warmer
   */
  warmUpImages = async (prisma: PrismaClient): Promise<void> => {
    if (this.isWarming) return;
    this.isWarming = true;
    try {
      const products = await prisma.product.findMany({
        select: {
          images: { select: { url: true } },
        },
        take: 200,
      });

      const fileIds = new Set<string>();
      products.forEach((p) => {
        p.images.forEach((img) => {
          if (img.url) {
            const match = img.url.match(/[?&]id=([a-zA-Z0-9_-]+)/) || img.url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
              fileIds.add(match[1]);
            }
          }
        });
      });

      // Warm up in background batches
      const idList = Array.from(fileIds);
      for (let i = 0; i < idList.length; i += 5) {
        const batch = idList.slice(i, i + 5);
        await Promise.all(
          batch.map(async (fileId) => {
            const cacheKey = `img:${fileId}`;
            if (!imageBufferCache.has(cacheKey)) {
              await this.fetchAndCacheImage(fileId);
            }
          }),
        );
      }
    } catch {
      // background warming silent catch
    } finally {
      this.isWarming = false;
    }
  };

  private fetchAndCacheImage = async (fileId: string): Promise<CachedImage | null> => {
    const cacheKey = `img:${fileId}`;
    const cached = imageBufferCache.get(cacheKey);
    if (cached) return cached;

    const driveEndpoints = [
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      `https://lh3.googleusercontent.com/d/${fileId}`,
    ];

    for (const fetchUrl of driveEndpoints) {
      try {
        const response = await fetch(fetchUrl, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.startsWith('image/')) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const data = { buffer, contentType };
            imageBufferCache.set(cacheKey, data);
            return data;
          }
        }
      } catch {
        // try next endpoint
      }
    }
    return null;
  };

  /**
   * Proxy image from Google Drive or remote URL
   * GET /api/v1/images/proxy?id=FILE_ID
   */
  proxyImage = async (req: Request, res: Response): Promise<void> => {
    const rawUrl = req.query.url as string | undefined;
    const rawId = req.query.id as string | undefined;

    let fileId = rawId?.trim();
    if (!fileId && rawUrl) {
      const match = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/) || rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        fileId = match[1];
      }
    }

    if (!fileId) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(DEFAULT_SVG_FALLBACK);
      return;
    }

    const data = await this.fetchAndCacheImage(fileId);

    if (data) {
      res.setHeader('Content-Type', data.contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.status(200).send(data.buffer);
      return;
    }

    // Return fallback SVG if fetch fails
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(DEFAULT_SVG_FALLBACK);
  };
}

export default ImageController;
