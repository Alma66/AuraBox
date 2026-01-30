import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-types.dto';
import { UpdateSubscriptionTypeDto } from './dto/update-subscription-types.dto';
import { Prisma, Frequency } from '@prisma/client';

function sanitize(nt: any) {
  if (!nt) return nt;
  if (nt.basePrice !== undefined && nt.basePrice !== null) {
    try {
      nt.basePrice = (nt.basePrice as any).toString();
    } catch {}
  }
  if (nt.cashDiscount !== undefined && nt.cashDiscount !== null) {
    try {
      nt.cashDiscount = (nt.cashDiscount as any).toString();
    } catch {}
  }
  if (nt.transferDiscount !== undefined && nt.transferDiscount !== null) {
    try {
      nt.transferDiscount = (nt.transferDiscount as any).toString();
    } catch {}
  }
  return nt;
}

@Injectable()
export class SubscriptionTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubscriptionTypeDto) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado (ID_Club inválido)');

    const data: Prisma.Subscription_TypesCreateInput = {
      idClub: dto.idClub,
      name: dto.name,
      description: dto.description ?? null,
      basePrice: dto.basePrice as any,
      frequency: dto.frequency as Frequency,
      cashDiscount: dto.cashDiscount ?? undefined,
      transferDiscount: dto.transferDiscount ?? undefined,
      active: dto.active ?? true,
    };

    try {
      const created = await this.prisma.subscription_Types.create({ data });
      return sanitize(created);
    } catch (err: any) {
      throw err;
    }
  }

  async findAll() {
    const rows = await this.prisma.subscription_Types.findMany({ orderBy: { id: 'desc' } });
    return rows.map((r) => sanitize(r));
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
    return rows.map((r) => sanitize(r));
  }

  async update(id: number, dto: UpdateSubscriptionTypeDto, userRole?: string) {
    const existing = await this.prisma.subscription_Types.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tipo de suscripción no encontrado');

    const data: Prisma.Subscription_TypesUpdateInput = {};
    if (dto.idClub !== undefined) data.idClub = dto.idClub;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.basePrice !== undefined) data.basePrice = dto.basePrice as any;
    if (dto.frequency !== undefined) data.frequency = dto.frequency as any;
    if (dto.cashDiscount !== undefined) data.cashDiscount = dto.cashDiscount as any;
    if (dto.transferDiscount !== undefined) data.transferDiscount = dto.transferDiscount as any;
    if (dto.active !== undefined) data.active = dto.active;

    const updated = await this.prisma.subscription_Types.update({
      where: { id },
      data,
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const existing = await this.prisma.subscription_Types.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tipo de suscripción no encontrado');
    await this.prisma.subscription_Types.delete({ where: { id } });
    return { ok: true };
  }
}