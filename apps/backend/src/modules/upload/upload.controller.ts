import type { Request, Response, NextFunction } from 'express';
import multer, { type Options as MulterOptions } from 'multer';
import { cloudinary } from '../../infrastructure/cloudinary/cloudinary.client.js';
import { BadRequestError } from '../../shared/errors/AppError.js';
import { env } from '../../config/env.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for admin catalogue images
const MAX_CUSTOMIZATION_FILE_SIZE = 200 * 1024 * 1024; // 200MB for customer photos

const uploadOptions = {
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  },
} satisfies MulterOptions;

const upload = multer({ ...uploadOptions, limits: { fileSize: MAX_FILE_SIZE } });
const customizationUpload = multer({
  ...uploadOptions,
  limits: { fileSize: MAX_CUSTOMIZATION_FILE_SIZE },
});

/**
 * Upload controller for image uploads to Cloudinary
 */
export class UploadController {
  private uploadFile(file: Express.Multer.File, folder: string): Promise<{ secure_url: string }> {
    return new Promise((resolve) => {
      const mime = file.mimetype || 'image/jpeg';
      const fallbackUrl = `data:${mime};base64,${file.buffer.toString('base64')}`;

      if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
        try {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
              if (error || !result) {
                resolve({ secure_url: fallbackUrl });
              } else {
                resolve(result);
              }
            },
          );
          stream.end(file.buffer);
        } catch {
          resolve({ secure_url: fallbackUrl });
        }
      } else {
        resolve({ secure_url: fallbackUrl });
      }
    });
  }

  private async uploadMultiple(files: Express.Multer.File[], folder: string): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestError('No image files provided');
    }
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, folder).then((res) => res.secure_url),
    );
    return Promise.all(uploadPromises);
  }

  uploadCustomizationImage = [
    customizationUpload.single('image'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.file) throw new BadRequestError('No image file provided');
        const result = await this.uploadFile(req.file, 'frames41/customizations');
        res.status(200).json({ success: true, data: { url: result.secure_url, urls: [result.secure_url] } });
      } catch (error) {
        next(error);
      }
    },
  ];

  uploadCustomizationImagesBatch = [
    customizationUpload.array('images', 20),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
        if (!files.length) throw new BadRequestError('No image files provided');
        const urls = await this.uploadMultiple(files, 'frames41/customizations');
        res.status(200).json({ success: true, data: { urls, url: urls[0] } });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * POST /admin/upload
   * Upload an image to Cloudinary (Admin only)
   */
  uploadImage = [
    upload.single('image'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.file) {
          throw new BadRequestError('No image file provided');
        }
        const result = await this.uploadFile(req.file, 'frames41/products');
        res.status(200).json({
          success: true,
          data: { url: result.secure_url, urls: [result.secure_url] },
          meta: {
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * POST /admin/upload/batch
   * Upload multiple images in a single bundled request (Admin only)
   */
  uploadBatchImages = [
    upload.array('images', 20),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
        if (!files.length) {
          throw new BadRequestError('No image files provided');
        }
        const urls = await this.uploadMultiple(files, 'frames41/products');
        res.status(200).json({
          success: true,
          data: { urls, url: urls[0] },
          meta: {
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        next(error);
      }
    },
  ];
}

export default UploadController;
