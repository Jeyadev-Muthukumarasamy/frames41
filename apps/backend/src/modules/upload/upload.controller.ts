import type { Request, Response, NextFunction } from 'express';
import multer, { type Options as MulterOptions } from 'multer';
import { cloudinary } from '../../infrastructure/cloudinary/cloudinary.client.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

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
  uploadCustomizationImage = [
    customizationUpload.single('image'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.file) throw new BadRequestError('No image file provided');
        const result = await this.upload(req.file.buffer, 'frames41/customizations');
        res.status(200).json({ success: true, data: { url: result.secure_url } });
      } catch (error) {
        next(error);
      }
    },
  ];

  private upload(buffer: Buffer, folder: string): Promise<{ secure_url: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error || !result) reject(new BadRequestError(error?.message || 'Cloudinary upload failed'));
          else resolve(result);
        },
      );
      stream.end(buffer);
    });
  }

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

        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'frames41/products',
              resource_type: 'image',
            },
            (error, result) => {
              if (error || !result) {
                reject(new BadRequestError(error?.message || 'Cloudinary upload failed'));
              } else {
                resolve(result);
              }
            },
          );
          stream.end(req.file!.buffer);
        });

        res.status(200).json({
          success: true,
          data: { url: result.secure_url },
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
