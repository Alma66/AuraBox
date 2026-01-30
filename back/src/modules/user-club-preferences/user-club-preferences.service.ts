import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserClubPreferenceDto } from './dto/create-user-club-preference.dto';
import { UpdateUserClubPreferenceDto } from './dto/update-user-club-preference.dto';

function sanitize(preference: any) {
  if (!preference) return preference;
  if (preference.updateDate instanceof Date) preference.updateDate = preference.updateDate.toISOString();
  return preference;
}

@Injectable()
export class UserClubPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserClubPreferenceDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    const subType = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
    if (!subType) throw new NotFoundException('Tipo de suscripción no encontrado');

    const created = await this.prisma.user_Club_Preferences.create({
      data: {
        idUser: dto.idUser,
        idSubscriptionTypes: dto.idSubscriptionTypes,
        idClub: dto.idClub,
        preferenceType: dto.preferenceType,
        preferenceValue: dto.preferenceValue,
        updateDate: dto.updateDate ? new Date(dto.updateDate) : new Date(),
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const preferences = await this.prisma.user_Club_Preferences.findMany({ orderBy: { updateDate: 'desc' } });
    return preferences.map(sanitize);
  }

  async findOne(id: number) {
    const item = await this.prisma.user_Club_Preferences.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Preferencia no encontrada');
    return sanitize(item);
  }

  async findByUser(idUser: number) {
    const preferences = await this.prisma.user_Club_Preferences.findMany({
      where: { idUser },
      orderBy: { updateDate: 'desc' },
    });
    return preferences.map(sanitize);
  }

  async findByClub(idClub: number) {
    const preferences = await this.prisma.user_Club_Preferences.findMany({
      where: { idClub },
      orderBy: { updateDate: 'desc' },
    });
    return preferences.map(sanitize);
  }

  async findBySubscriptionType(idSubscriptionTypes: number) {
    const preferences = await this.prisma.user_Club_Preferences.findMany({
      where: { idSubscriptionTypes },
      orderBy: { updateDate: 'desc' },
    });
    return preferences.map(sanitize);
  }

  async update(id: number, dto: UpdateUserClubPreferenceDto, user: any) {
    const item = await this.prisma.user_Club_Preferences.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Preferencia no encontrada');

    if (user.role !== 'ADMIN' && user.id !== item.idUser) {
      throw new ForbiddenException('No autorizado para modificar esta preferencia');
    }

    if ((dto as any).idUser) {
      const u = await this.prisma.user.findUnique({ where: { id: (dto as any).idUser } });
      if (!u) throw new NotFoundException('Usuario (nuevo) no encontrado');
    }
    if ((dto as any).idClub) {
      const c = await this.prisma.club.findUnique({ where: { id: (dto as any).idClub } });
      if (!c) throw new NotFoundException('Club (nuevo) no encontrado');
    }
    if ((dto as any).idSubscriptionTypes) {
      const st = await this.prisma.subscription_Types.findUnique({ where: { id: (dto as any).idSubscriptionTypes } });
      if (!st) throw new NotFoundException('Tipo de suscripción (nuevo) no encontrado');
    }

    const updated = await this.prisma.user_Club_Preferences.update({
      where: { id },
      data: {
        ...dto,
        updateDate: dto.updateDate ? new Date(dto.updateDate) : item.updateDate,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number, user: any) {
    const item = await this.prisma.user_Club_Preferences.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Preferencia no encontrada');

    if (user.role !== 'ADMIN' && user.id !== item.idUser) {
      throw new ForbiddenException('No autorizado para eliminar esta preferencia');
    }

    await this.prisma.user_Club_Preferences.delete({ where: { id } });
    return { message: 'Preferencia eliminada correctamente' };
  }
}