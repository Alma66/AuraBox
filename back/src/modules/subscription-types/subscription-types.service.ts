import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-types.dto';
import { UpdateSubscriptionTypeDto } from './dto/update-subscription-types.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { AURABOX_COMMISSION } from '../payments/payments.constants';
import { priceFor } from '../../common/utils/billing';
import { Prisma, Frequency } from '@prisma/client';

function sanitize(nt: any) {
  type RequestUser = { id: number; role: string };
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

  private assertPricing(price: unknown, cash: unknown, transfer: unknown) {
    const base = Number(price);
    if (!Number.isFinite(base) || base <= AURABOX_COMMISSION) {
      throw new BadRequestException(`El precio debe ser mayor a $${AURABOX_COMMISSION}`);
    }
    for (const discount of [cash, transfer]) {
      if (discount === undefined || discount === null) continue;
      const value = Number(discount);
      if (!Number.isFinite(value) || value < 0 || value > 90) {
        throw new BadRequestException('Los descuentos deben estar entre 0 y 90%');
      }
    }
    if (priceFor(base, transfer, true) <= AURABOX_COMMISSION) {
      throw new BadRequestException('Con el descuento por transferencia el precio queda por debajo del mínimo');
    }
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

    this.assertPricing(dto.basePrice ?? (dto as any).price, dto.cashDiscount, dto.transferDiscount);

    const includesStr = Array.isArray(dto.includes)
      ? JSON.stringify(dto.includes)
      : (dto.includes ?? null);

    const data: Prisma.Subscription_TypesCreateInput = {
      idClub: dto.idClub,
      name: dto.name,
      description: dto.description ?? null,
      basePrice: (dto.basePrice ?? (dto as any).price) as any,
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

    private async canSeeAllPlans(idClub: number, user?: RequestUser) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'entrepreneur') return false;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idEntrepreneurs: user.id, idClub },
    });
    return !!assoc;
  }

  async findByIdForRequester(id: number, user?: RequestUser) {
    const plan = await this.prisma.subscription_Types.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Tipo de suscripción no encontrado');

    if (await this.canSeeAllPlans(plan.idClub, user)) return sanitize(plan);

    if (user?.role === 'customer') {
      const subscription = await this.prisma.user_Subscriptions.findFirst({
        where: { idUser: user.id, idSubscriptionTypes: id },
      });
      if (subscription) return sanitize(plan);
    }

    const club = await this.prisma.club.findUnique({ where: { id: plan.idClub } });
    if (!plan.active || !club || club.clubStatus !== 'APROBADO') {
      throw new NotFoundException('Tipo de suscripción no encontrado');
    }
    return sanitize(plan);
  }

  async findByClubForRequester(idClub: number, user?: RequestUser) {
    if (!Number.isInteger(idClub)) return [];
    if (await this.canSeeAllPlans(idClub, user)) return this.findByClub(idClub);

    const club = await this.prisma.club.findUnique({ where: { id: idClub } });
    if (!club || club.clubStatus !== 'APROBADO') return [];

    const rows = await this.prisma.subscription_Types.findMany({
      where: { idClub, active: true },
      orderBy: { id: 'desc' },
    });
    return rows.map(sanitize);
  }

  async findAllForRequester(user?: RequestUser) {
    if (user?.role === 'admin') return this.findAll();

    const clubs = await this.prisma.club.findMany({
      where: { clubStatus: 'APROBADO' },
      select: { id: true },
    });
    const rows = await this.prisma.subscription_Types.findMany({
      where: { active: true, idClub: { in: clubs.map((club) => club.id) } },
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

    const newPrice = dto.basePrice ?? (dto as any).price;
    if (newPrice !== undefined || dto.cashDiscount !== undefined || dto.transferDiscount !== undefined) {
      this.assertPricing(
        newPrice ?? existing.basePrice,
        dto.cashDiscount ?? existing.cashDiscount,
        dto.transferDiscount ?? existing.transferDiscount,
      );
    }

    const data: Prisma.Subscription_TypesUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (newPrice !== undefined) data.basePrice = newPrice as any;
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

    const subscriptions = await this.prisma.user_Subscriptions.count({ where: { idSubscriptionTypes: id } });
    if (subscriptions > 0) {
      throw new BadRequestException('Este plan ya tiene suscripciones registradas. Desactivalo en lugar de eliminarlo.');
    }

    await this.prisma.$transaction([
      this.prisma.cart_Item.deleteMany({ where: { idSubscriptionTypes: id } }),
      this.prisma.favorites.deleteMany({ where: { idSubscriptionTypes: id } }),
      this.prisma.boxContentHistory.deleteMany({ where: { idSubscriptionTypes: id } }),
      this.prisma.subscription_Types.delete({ where: { id } }),
    ]);
    await this.deleteAsset(existing.imageUrl);
    return { ok: true };
  }
}