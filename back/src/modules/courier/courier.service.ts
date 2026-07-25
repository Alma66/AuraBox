import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { SetClubCouriersDto } from './dto/set-club-couriers.dto';
import { SetCourierFeeDto } from './dto/set-courier-fee.dto';

type RequestUser = { id: number; role: string };

function sanitizeFee(item: any) {
  if (!item) return item;
  if (item.baseFee !== undefined && item.baseFee !== null) {
    try {
      item.baseFee = item.baseFee.toString();
    } catch {}
  }
  return item;
}

@Injectable()
export class CourierService {
  constructor(private readonly prisma: PrismaService) {}

  async assertClubAccess(idClub: number, user: RequestUser) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  async create(dto: CreateCourierDto) {
    const exists = await this.prisma.courier.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException('Ya existe un courier con ese código');
    return this.prisma.courier.create({
      data: {
        code: dto.code,
        name: dto.name,
        isInternal: dto.isInternal ?? false,
        active: dto.active ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.courier.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
  }

  async findByClub(idClub: number) {
    const clubCouriers = await this.prisma.club_Courier.findMany({
      where: { idClub, active: true },
    });
    const courierIds = clubCouriers.map((c) => c.idCourier);
    if (courierIds.length === 0) return [];
    const couriers = await this.prisma.courier.findMany({
      where: { id: { in: courierIds }, active: true },
      orderBy: { name: 'asc' },
    });
    const feeByCourierId = new Map(clubCouriers.map((c) => [c.idCourier, c.baseFee]));
    return couriers.map((c) => sanitizeFee({ ...c, baseFee: feeByCourierId.get(c.id) ?? null }));
  }

  async setClubCouriers(idClub: number, dto: SetClubCouriersDto) {
    const club = await this.prisma.club.findUnique({ where: { id: idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    const validCouriers = await this.prisma.courier.findMany({
      where: { id: { in: dto.courierIds }, active: true },
    });
    if (validCouriers.length !== dto.courierIds.length) {
      throw new NotFoundException('Uno o más couriers no existen');
    }

    const existing = await this.prisma.club_Courier.findMany({ where: { idClub } });
    const existingByCourierId = new Map(existing.map((e) => [e.idCourier, e]));

    const operations = dto.courierIds.map((idCourier) => {
      const current = existingByCourierId.get(idCourier);
      if (current) {
        return this.prisma.club_Courier.update({ where: { id: current.id }, data: { active: true } });
      }
      return this.prisma.club_Courier.create({ data: { idClub, idCourier, active: true } });
    });

    const toDeactivate = existing.filter((e) => !dto.courierIds.includes(e.idCourier) && e.active);
    const deactivateOperations = toDeactivate.map((e) =>
      this.prisma.club_Courier.update({ where: { id: e.id }, data: { active: false } }),
    );

    await this.prisma.$transaction([...operations, ...deactivateOperations]);
    return this.findByClub(idClub);
  }

  async setCourierFee(idClub: number, idCourier: number, dto: SetCourierFeeDto) {
    const link = await this.prisma.club_Courier.findUnique({
      where: { idClub_idCourier: { idClub, idCourier } },
    });
    if (!link) throw new NotFoundException('Este courier no está habilitado para este club');
    const updated = await this.prisma.club_Courier.update({
      where: { id: link.id },
      data: { baseFee: dto.baseFee },
    });
    return sanitizeFee(updated);
  }
}