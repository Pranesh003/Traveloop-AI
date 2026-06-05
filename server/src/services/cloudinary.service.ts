import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '../config/env';
import logger from '../utils/logger';
import { AppError } from '../utils/AppError';

// Configure Cloudinary
if (env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export type CloudinaryFolder =
  | 'traveloop/avatars'
  | 'traveloop/trips'
  | 'traveloop/destinations'
  | 'traveloop/packages'
  | 'traveloop/activities'
  | 'traveloop/community';

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const cloudinaryService = {
  /**
   * Upload a buffer to Cloudinary
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: CloudinaryFolder,
    options: Record<string, unknown> = {},
  ): Promise<UploadResult> {
    if (!env.CLOUDINARY_CLOUD_NAME) {
      throw AppError.internal('Cloudinary is not configured. Please add CLOUDINARY_* env vars.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          ...options,
        },
        (error, result) => {
          if (error || !result) {
            logger.error('Cloudinary upload error:', error);
            reject(AppError.internal('Image upload failed'));
            return;
          }
          resolve({
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );
      uploadStream.end(buffer);
    });
  },

  /**
   * Upload multiple buffers
   */
  async uploadBuffers(
    buffers: Buffer[],
    folder: CloudinaryFolder,
  ): Promise<UploadResult[]> {
    return Promise.all(buffers.map(buf => this.uploadBuffer(buf, folder)));
  },

  /**
   * Delete an image by public_id
   */
  async delete(publicId: string): Promise<void> {
    if (!env.CLOUDINARY_CLOUD_NAME) return;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
    }
  },

  /**
   * Generate optimized URL with transformations
   */
  getOptimizedUrl(publicId: string, options: Record<string, unknown> = {}): string {
    return cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    });
  },

  /**
   * Generate thumbnail URL
   */
  getThumbnailUrl(publicId: string, width = 400, height = 300): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    });
  },
};
