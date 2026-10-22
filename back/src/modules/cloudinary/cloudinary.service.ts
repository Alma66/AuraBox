import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { hasValidImageSignature } from '../../common/utils/image-upload';

function ensureConfigured() {
  const cfg = cloudinary.config();
  if (!cfg.api_key) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File, folder: string = 'aurabox'): Promise<string> {
    if (!file?.buffer || !hasValidImageSignature(file.buffer)) {
      throw new BadRequestException('El archivo no es una imagen válida');
    }
    ensureConfigured();
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async uploadVideo(file: Express.Multer.File, folder: string = 'aurabox'): Promise<string> {
    ensureConfigured();
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'video',
          transformation: [{ quality: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    if (!publicId) return;
    ensureConfigured();
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }

  extractPublicId(url: string): string {
    const clean = (url || '').split('?')[0];
    const marker = '/upload/';
    const index = clean.indexOf(marker);
    if (index === -1) return '';
    return clean
      .slice(index + marker.length)
      .replace(/^v\d+\//, '')
      .replace(/\.[^./]+$/, '');
  }

  async uploadDocument(file: Express.Multer.File, folder: string = 'aurabox'): Promise<string> {
    ensureConfigured();
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'raw' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}