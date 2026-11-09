import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

export interface StoredDocument {
  publicId: string;
  deliveryType: 'upload' | 'authenticated';
}

const DOCUMENT_PATTERN = /\/raw\/(upload|authenticated)\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+)$/;

function detectContentType(buffer: Buffer): string {
  if (buffer.length >= 4 && buffer.slice(0, 4).toString('latin1') === '%PDF') return 'application/pdf';
  if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  return 'application/octet-stream';
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
        { folder, resource_type: 'raw', type: 'authenticated' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  parseDocumentUrl(url: string): StoredDocument | null {
    const clean = (url || '').split('?')[0];
    const match = DOCUMENT_PATTERN.exec(clean);
    if (!match) return null;
    return {
      deliveryType: match[1] as 'upload' | 'authenticated',
      publicId: decodeURIComponent(match[2]),
    };
  }

  async fetchDocument(url: string): Promise<{ buffer: Buffer; contentType: string }> {
    const stored = this.parseDocumentUrl(url);
    if (!stored) throw new NotFoundException('Documento no disponible');

    let target = url;
    if (stored.deliveryType === 'authenticated') {
      ensureConfigured();
      target = cloudinary.url(stored.publicId, {
        resource_type: 'raw',
        type: 'authenticated',
        sign_url: true,
        secure: true,
      });
    } else if (new URL(url).hostname !== 'res.cloudinary.com') {
      throw new NotFoundException('Documento no disponible');
    }

    const response = await fetch(target);
    if (!response.ok) throw new NotFoundException('No se pudo obtener el documento');
    const buffer = Buffer.from(await response.arrayBuffer());
    return { buffer, contentType: detectContentType(buffer) };
  }

  async deleteDocument(url: string): Promise<void> {
    const stored = this.parseDocumentUrl(url);
    if (!stored) return;
    ensureConfigured();
    await cloudinary.uploader.destroy(stored.publicId, {
      resource_type: 'raw',
      type: stored.deliveryType,
    } as any);
  }

  async secureDocument(url: string): Promise<string | null> {
    const stored = this.parseDocumentUrl(url);
    if (!stored || stored.deliveryType === 'authenticated') return null;
    ensureConfigured();
    const result: any = await cloudinary.uploader.rename(stored.publicId, stored.publicId, {
      resource_type: 'raw',
      type: 'upload',
      to_type: 'authenticated',
      overwrite: true,
      invalidate: true,
    } as any);
    return typeof result?.secure_url === 'string' ? result.secure_url : null;
  }
}