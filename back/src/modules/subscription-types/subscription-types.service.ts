import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-types.dto';
import { UpdateSubscriptionTypeDto } from './dto/update-subscription-types.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Prisma, Frequency } from '@prisma/client';

function sanitize(nt: any) {
  if (!nt) return nt;
  for (const field of ['basePrice', 'cashDiscount', 'transferDiscount']) {
    if (nt[field] !== undefined && nt[field] !== null) {
      try { nt[field] = nt[field].toString(); } catch {}
    }
  }
  if (nt.createdAt instanceof Date) {
    nt.createdAt = nt.createdAt.toISOString();
  }
  if (nt.includes && typeof nt.includes === 'string') {
    try { nt.includes = JSON.parse(nt.includes); } catch { nt.includes = []; }
  }
  return nt;
}

@Injectable()
export class SubscriptionTypesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private async assertEntrepreneurOwnsClub(entrepreneurId: number, clubId: number) {
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idEntrepreneurs: entrepreneurId, idClub: clubId },
    });
    if (!assoc) throw new ForbiddenException('No sos owner de este club');
  }

  private async deleteAsset(imageUrl?: string | null) {
    if (!imageUrl) return;
    const publicId = this.cloudinary.extractPublicId(imageUrl);
    if (!publicId) return;
    try {
      await this.cloudinary.deleteImage(publicId);
    } catch {}
  }

  async create(dto: CreateSubscriptionTypeDto, requesterId?: number, requesterRole?: string) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    if (requesterRole === 'entrepreneur' && requesterId) {
      await this.assertEntrepreneurOwnsClub(requesterId, dto.idClub);
    }

    const includesStr = Array.isArray(dto.includes)
      ? JSON.stringify(dto.includes)
      : (dto.includes ?? null);

    const data: Prisma.Subscription_TypesCreateInput = {
      idClub: dto.idClub,
      name: dto.name,
      description: dto.description ?? null,
      basePrice: (dto.basePrice ?? dto.price) as any,
      frequency: dto.frequency as Frequency,
      cashDiscount: dto.cashDiscount ?? undefined,
      transferDiscount: dto.transferDiscount ?? undefined,
      active: dto.active ?? true,
      shippingAreas: dto.shippingAreas ?? null,
      includes: includesStr,
      imageUrl: dto.imageUrl ?? null,
    };

    const created = await this.prisma.subscription_Types.create({ data });
    return sanitize(created);
  }

  async findAll() {
    const rows = await this.prisma.subscription_Types.findMany({ orderBy: { id: 'desc' } });
    return rows.map(sanitize);
  }

  async findById(id: number) {
    const row = await this.prisma.subscription_Types.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Tipo de suscripción no encontrado');
    return sanitize(row);
  }

  async findByClub(idClub: number) {
    const rows = await this.prisma.subscription_Types.findMany({
      where: { idClub },
      orderBy: { id: 'desc' },
    });
    return rows.map(sanitize);
  }

  async update(id: number, dto: UpdateSubscriptionTypeDto, requesterId?: number, requesterRole?: string) {
    const existing = await this.prisma.subscription_Types.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tipo de suscripción no encontrado');

    if (requesterRole === 'entrepreneur' && requesterId) {
      await this.assertEntrepreneurOwnsClub(requesterId, existing.idClub);
    }

    const data: Prisma.Subscription_TypesUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.basePrice !== undefined || (dto as any).price !== undefined) {
      data.basePrice = (dto.basePrice ?? (dto as any).price) as any;
    }
    if (dto.frequency !== undefined) data.frequency = dto.frequency as any;
    if (dto.cashDiscount !== undefined) data.cashDiscount = dto.cashDiscount as any;
    if (dto.transferDiscount !== undefined) data.transferDiscount = dto.transferDiscount as any;
    if (dto.active !== undefined) data.active = dto.active;
    if (dto.shippingAreas !== undefined) data.shippingAreas = dto.shippingAreas;
    if (dto.includes !== undefined) {
      data.includes = Array.isArray(dto.includes)
        ? JSON.stringify(dto.includes)
        : dto.includes;
    }
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;

    const updated = await this.prisma.subscription_Types.update({ where: { id }, data });
    return sanitize(updated);
  }

  async updateImage(id: number, imageFile: Express.Multer.File, requesterId?: number, requesterRole?: string) {
    if (!imageFile) throw new BadRequestException('Se requiere una imagen');

    const existing = await this.prisma.subscription_Types.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tipo de suscripción no encontrado');

    if (requesterRole === 'entrepreneur' && requesterId) {
      await this.assertEntrepreneurOwnsClub(requesterId, existing.idClub);
    }

    const imageUrl = await this.cloudinary.uploadImage(imageFile, 'aurabox/plans/images');
    const updated = await this.prisma.subscription_Types.update({
      where: { id },
      data: { imageUrl },
    });

    if (existing.imageUrl && existing.imageUrl !== imageUrl) {
      await this.deleteAsset(existing.imageUrl);
    }

    return { imageUrl: updated.imageUrl };
  }

  async remove(id: number, requesterId?: number, requesterRole?: string) {
    const existing = await this.prisma.subscription_Types.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tipo de suscripción no encontrado');

    if (requesterRole === 'entrepreneur' && requesterId) {
      await this.assertEntrepreneurOwnsClub(requesterId, existing.idClub);
    }

    await this.prisma.subscription_Types.delete({ where: { id } });
    await this.deleteAsset(existing.imageUrl);
    return { ok: true };
  }
}