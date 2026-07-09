import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    if (!imageUrl) throw new BadRequestException('Se requiere una imagen');

    const section = dto.section ?? 'Banner';
    const isActive = dto.isActive ?? false;

    if (isActive && section === 'Logo') {
      await this.prisma.image_Club.updateMany({
        where: { idClub: dto.idClub, section: 'Logo', isActive: true },
        data: { isActive: false },
      });
    }

    const created = await this.prisma.image_Club.create({
      data: {
        idClub: dto.idClub,
        imageUrl,
        description: dto.description ?? null,
        contentType: dto.contentType ?? 'Imagen',
        uploadDate: dto.uploadDate ? new Date(dto.uploadDate) : new Date(),
        uploadedBy: dto.uploadedBy ?? null,
        section,
        isActive,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const images = await this.prisma.image_Club.findMany({ orderBy: { id: 'desc' } });
    return images.map(sanitize);
  }

  async findByClub(idClub: number, section?: string) {
    if (section === 'Logo') {
      await this.ensureLogoImage(idClub);
    }
    if (section) {
      await this.backfillSection(idClub, section);
    }

    const images = await this.prisma.image_Club.findMany({
      where: { idClub, ...(section ? { section: section as any } : {}) },
      orderBy: { id: 'desc' },
    });
    return images.map(sanitize);
  }

  private async ensureLogoImage(idClub: number) {
    const existing = await this.prisma.image_Club.findFirst({
      where: { idClub, section: 'Logo' },
    });
    if (existing) return;

    const club = await this.prisma.club.findUnique({ where: { id: idClub } });
    if (!club?.logoUrl) return;

    await this.prisma.image_Club.create({
      data: {
        idClub,
        imageUrl: club.logoUrl,
        contentType: 'Imagen',
        section: 'Logo',
        isActive: true,
      },
    });
  }

  private async backfillSection(idClub: number, section: string) {
    if (section === 'Historia') {
      await this.prisma.image_Club.updateMany({
        where: { idClub, description: 'historia', NOT: { section: 'Historia' } },
        data: { section: 'Historia' },
      });
    } else if (section === 'Equipo') {
      await this.prisma.image_Club.updateMany({
        where: { idClub, description: { startsWith: 'team-' }, NOT: { section: 'Equipo' } },
        data: { section: 'Equipo' },
      });
    }
  }

  async findOne(id: number) {
    const item = await this.prisma.image_Club.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Imagen no encontrada');
    return sanitize(item);
  }

  async update(id: number, dto: UpdateImageClubDto) {
    const item = await this.prisma.image_Club.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Imagen no encontrada');

    const targetSection = dto.section ?? item.section;
    const targetActive = dto.isActive ?? item.isActive;

    if (targetActive && targetSection === 'Logo') {
      await this.prisma.image_Club.updateMany({
        where: { idClub: item.idClub, section: 'Logo', isActive: true, id: { not: id } },
        data: { isActive: false },
      });
    }

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

  async removeMany(ids: number[]) {
    const items = await this.prisma.image_Club.findMany({ where: { id: { in: ids } } });
    for (const item of items) {
      if (item.imageUrl) {
        try {
          const publicId = this.cloudinary.extractPublicId(item.imageUrl);
          await this.cloudinary.deleteImage(publicId);
        } catch {}
      }
    }
    await this.prisma.image_Club.deleteMany({ where: { id: { in: ids } } });
    return { message: `${items.length} imágenes eliminadas correctamente` };
  }
}