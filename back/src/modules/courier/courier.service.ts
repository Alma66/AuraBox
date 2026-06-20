import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { SetClubCouriersDto } from './dto/set-club-couriers.dto';

@Injectable()
export class CourierService {
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.courier.findMany({
      where: { id: { in: courierIds }, active: true },
      orderBy: { name: 'asc' },
    });
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
}