import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Image_Club, ImageSection, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateImageClubDto } from './dto/create-image-club.dto';
import { UpdateImageClubDto } from './dto/update-image-club.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

type RequestUser = { id: number; role: string };

const DEFAULT_ACTIVE_SECTIONS: ImageSection[] = [ImageSection.Banner, ImageSection.Historia];

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

  private async assertClubAccess(idClub: number, user: RequestUser) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  private async syncClubLogo(idClub: number, imageUrl: string) {
    await this.prisma.club.update({ where: { id: idClub }, data: { logoUrl: imageUrl } });
  }

  private assertNoLogoInUse(items: Image_Club[]) {
    const inUse = items.some((i) => i.section === ImageSection.Logo && i.isActive);
    if (inUse) {
      throw new BadRequestException('No podés eliminar el logo en uso. Elegí otro logo antes.');
    }
  }

  private async deleteAssetIfUnused(imageUrl: string) {
    if (!imageUrl) return;
    const [images, clubs, plans] = await Promise.all([
      this.prisma.image_Club.count({ where: { imageUrl } }),
      this.prisma.club.count({ where: { logoUrl: imageUrl } }),
      this.prisma.subscription_Types.count({ where: { imageUrl } }),
    ]);
    if (images + clubs + plans > 0) return;
    const publicId = this.cloudinary.extractPublicId(imageUrl);
    if (!publicId) return;
    try {
      await this.cloudinary.deleteImage(publicId);
    } catch {}
  }

  async create(dto: CreateImageClubDto, imageFile: Express.Multer.File | undefined, user: RequestUser) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    await this.assertClubAccess(dto.idClub, user);

    let imageUrl = dto.imageUrl ?? '';
    if (imageFile) {
      imageUrl = await this.cloudinary.uploadImage(imageFile, 'aurabox/clubs/gallery');
    }
    if (!imageUrl) throw new BadRequestException('Se requiere una imagen');

    const section = dto.section ?? ImageSection.Banner;
    const isActive = dto.isActive ?? DEFAULT_ACTIVE_SECTIONS.includes(section);
    const makesLogoActive = isActive && section === ImageSection.Logo;

    if (makesLogoActive) {
      await this.prisma.image_Club.updateMany({
        where: { idClub: dto.idClub, section: ImageSection.Logo, isActive: true },
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
        uploadedBy: user.role === 'entrepreneur' ? user.id : null,
        section,
        isActive,
      },
    });

    if (makesLogoActive) {
      await this.syncClubLogo(dto.idClub, imageUrl);
    }

    return sanitize(created);
  }

  async findAll() {
    const images = await this.prisma.image_Club.findMany({ orderBy: { id: 'desc' } });
    return images.map(sanitize);
  }

  async findByClub(idClub: number, section?: string) {
    if (section && !(Object.values(ImageSection) as string[]).includes(section)) {
      throw new BadRequestException('Sección inválida');
    }
    if (section === ImageSection.Logo) {
      await this.ensureLogoImage(idClub);
    }
    if (section) {
      await this.backfillSection(idClub, section);
    }

    const images = await this.prisma.image_Club.findMany({
      where: { idClub, ...(section ? { section: section as ImageSection } : {}) },
      orderBy: { id: 'desc' },
    });
    return images.map(sanitize);
  }

  private async ensureLogoImage(idClub: number) {
    const existing = await this.prisma.image_Club.findFirst({
      where: { idClub, section: ImageSection.Logo },
    });
    if (existing) return;

    const club = await this.prisma.club.findUnique({ where: { id: idClub } });
    if (!club?.logoUrl) return;

    await this.prisma.image_Club.create({
      data: {
        idClub,
        imageUrl: club.logoUrl,
        contentType: 'Imagen',
        section: ImageSection.Logo,
        isActive: true,
      },
    });
  }

  private async backfillSection(idClub: number, section: string) {
    if (section === ImageSection.Historia) {
      await this.prisma.image_Club.updateMany({
        where: { idClub, description: 'historia', NOT: { section: ImageSection.Historia } },
        data: { section: ImageSection.Historia },
      });
    } else if (section === ImageSection.Equipo) {
      await this.prisma.image_Club.updateMany({
        where: { idClub, description: { startsWith: 'team-' }, NOT: { section: ImageSection.Equipo } },
        data: { section: ImageSection.Equipo },
      });
    }
  }

  async findOne(id: number) {
    const item = await this.prisma.image_Club.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Imagen no encontrada');
    return sanitize(item);
  }

  async update(id: number, dto: UpdateImageClubDto, user: RequestUser) {
    const item = await this.prisma.image_Club.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Imagen no encontrada');
    await this.assertClubAccess(item.idClub, user);

    const targetSection = dto.section ?? item.section;
    const targetActive = dto.isActive ?? item.isActive;
    const wasLogoInUse = item.section === ImageSection.Logo && item.isActive;
    const willBeLogoInUse = targetSection === ImageSection.Logo && targetActive;

    if (wasLogoInUse && !willBeLogoInUse) {
      throw new BadRequestException('Elegí otro logo para usar antes de quitar este.');
    }

    if (willBeLogoInUse && !wasLogoInUse) {
      await this.prisma.image_Club.updateMany({
        where: { idClub: item.idClub, section: ImageSection.Logo, isActive: true, id: { not: id } },
        data: { isActive: false },
      });
    }

    const data: Prisma.Image_ClubUpdateInput = {};
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.section !== undefined) data.section = dto.section;
    if (dto.contentType !== undefined) data.contentType = dto.contentType;

    const updated = await this.prisma.image_Club.update({ where: { id }, data });

    if (willBeLogoInUse && !wasLogoInUse) {
      await this.syncClubLogo(item.idClub, item.imageUrl);
    }

    return sanitize(updated);
  }

  async remove(id: number, user: RequestUser) {
    const item = await this.prisma.image_Club.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Imagen no encontrada');
    await this.assertClubAccess(item.idClub, user);
    this.assertNoLogoInUse([item]);

    await this.prisma.image_Club.delete({ where: { id } });
    await this.deleteAssetIfUnused(item.imageUrl);
    return { message: 'Imagen eliminada correctamente' };
  }

  async removeMany(ids: number[], user: RequestUser) {
    const cleanIds = Array.isArray(ids)
      ? Array.from(new Set(ids.map(Number).filter((n) => Number.isInteger(n) && n > 0)))
      : [];
    if (cleanIds.length === 0) throw new BadRequestException('No se indicaron imágenes');

    const items = await this.prisma.image_Club.findMany({ where: { id: { in: cleanIds } } });
    if (items.length === 0) throw new NotFoundException('Imágenes no encontradas');

    const clubIds = Array.from(new Set(items.map((i) => i.idClub)));
    for (const idClub of clubIds) {
      await this.assertClubAccess(idClub, user);
    }
    this.assertNoLogoInUse(items);

    await this.prisma.image_Club.deleteMany({ where: { id: { in: items.map((i) => i.id) } } });

    const urls = Array.from(new Set(items.map((i) => i.imageUrl)));
    for (const url of urls) {
      await this.deleteAssetIfUnused(url);
    }
    return { message: `${items.length} imágenes eliminadas correctamente` };
  }
}