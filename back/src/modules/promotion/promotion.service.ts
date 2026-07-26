import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

type RequestUser = { id: number; role: string };

function sanitize(promo: any) {
  if (!promo) return promo;
  if (promo.discountPercentage !== undefined && promo.discountPercentage !== null) {
    try { promo.discountPercentage = promo.discountPercentage.toString(); } catch {}
  }
  if (promo.startDate instanceof Date) promo.startDate = promo.startDate.toISOString();
  if (promo.endDate instanceof Date) promo.endDate = promo.endDate.toISOString();
  if (promo.createdAt instanceof Date) promo.createdAt = promo.createdAt.toISOString();
  return promo;
}

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertClubAccess(idClub: number, user: RequestUser) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  async create(dto: CreatePromotionDto, user: RequestUser) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    await this.assertClubAccess(dto.idClub, user);

    const created = await this.prisma.promotion.create({
      data: {
        idClub: dto.idClub,
        name: dto.name,
        description: dto.description ?? null,
        promotionType: dto.promotionType,
        discountPercentage: dto.discountPercentage ?? null,
        idSubscriptionTypes: dto.idSubscriptionTypes ?? null,
        comboSubscriptionIds: dto.comboSubscriptionIds ?? null,
        minSubscriptionsQty: dto.minSubscriptionsQty ?? null,
        freeShipping: dto.freeShipping ?? false,
        couponCode: dto.couponCode ?? null,
        durationMonths: dto.durationMonths ?? null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        active: dto.active ?? true,
        createdBy: user.id,
      },
    });
    return sanitize(created);
  }

  async findByClub(idClub: number, user: RequestUser) {
    await this.assertClubAccess(idClub, user);
    const promos = await this.prisma.promotion.findMany({
      where: { idClub },
      orderBy: { createdAt: 'desc' },
    });
    return promos.map(sanitize);
  }

  async findOne(id: number, user: RequestUser) {
    const promo = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promoción no encontrada');
    await this.assertClubAccess(promo.idClub, user);
    return sanitize(promo);
  }

  async update(id: number, dto: UpdatePromotionDto, user: RequestUser) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promoción no encontrada');
    await this.assertClubAccess(existing.idClub, user);

    const targetIdClub = user.role === 'admin' && dto.idClub ? dto.idClub : existing.idClub;

    const updated = await this.prisma.promotion.update({
      where: { id },
      data: {
        ...dto,
        idClub: targetIdClub,
        startDate: dto.startDate ? new Date(dto.startDate) : existing.startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : existing.endDate,
      },
    });
    return sanitize(updated);
  }

  async toggleActive(id: number, active: boolean, user: RequestUser) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promoción no encontrada');
    await this.assertClubAccess(existing.idClub, user);
    const updated = await this.prisma.promotion.update({ where: { id }, data: { active } });
    return sanitize(updated);
  }

  async remove(id: number, user: RequestUser) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promoción no encontrada');
    await this.assertClubAccess(existing.idClub, user);
    await this.prisma.promotion.delete({ where: { id } });
    return { message: 'Promoción eliminada correctamente' };
  }
}