import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateImageClubDto } from './dto/create-image-club.dto';
import { UpdateImageClubDto } from './dto/update-image-club.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

function sanitize(image: any) {
  if (!image) return image;
  if (image.uploadDate instanceof Date) image.uploadDate = image.uploadDate.toISOString();
  return image;
}

@Injectable()
export class ImageClubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(dto: CreateImageClubDto, imageFile?: Express.Multer.File) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    let imageUrl = dto.imageUrl ?? '';
    if (imageFile) {
      imageUrl = await this.cloudinary.uploadImage(imageFile, 'aurabox/clubs/gallery');
    }

    const created = await this.prisma.image_Club.create({
      data: {
        idClub: dto.idClub,
        imageUrl,
        description: dto.description ?? null,
        contentType: dto.contentType ?? 'Imagen',
        uploadDate: dto.uploadDate ? new Date(dto.uploadDate) : new Date(),
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const images = await this.prisma.image_Club.findMany({ orderBy: { id: 'desc' } });
    return images.map(sanitize);
  }

  async findByClub(idClub: number) {
    const images = await this.prisma.image_Club.findMany({
      where: { idClub },
      orderBy: { id: 'desc' },
    });
    return images.map(sanitize);
  }

  async findOne(id: number) {
    const item = await this.prisma.image_Club.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Imagen no encontrada');
    return sanitize(item);
  }

  async update(id: number, dto: UpdateImageClubDto) {
    const item = await this.prisma.image_Club.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Imagen no encontrada');
    const updated = await this.prisma.image_Club.update({
      where: { id },
      data: {
        ...dto,
        uploadDate: dto.uploadDate ? new Date(dto.uploadDate) : item.uploadDate,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const item = await this.prisma.image_Club.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Imagen no encontrada');

    if (item.imageUrl) {
      const publicId = this.cloudinary.extractPublicId(item.imageUrl);
      await this.cloudinary.deleteImage(publicId);
    }

    await this.prisma.image_Club.delete({ where: { id } });
    return { message: 'Imagen eliminada correctamente' };
  }
}