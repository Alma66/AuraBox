import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserClubPreferenceDto } from './dto/create-user-club-preference.dto';
import { UpdateUserClubPreferenceDto } from './dto/update-user-club-preference.dto';

type RequestUser = { id: number; role: string };

function sanitize(preference: any) {
  if (!preference) return preference;
  if (preference.updateDate instanceof Date) preference.updateDate = preference.updateDate.toISOString();
  return preference;
}

@Injectable()
export class UserClubPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertClubAccess(idClub: number, user: RequestUser) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  private async assertPreferenceAccess(item: { idUser: number; idClub: number }, user: RequestUser) {
    if (user.role === 'admin') return;
    if (user.role === 'customer' && item.idUser === user.id) return;
    if (user.role === 'entrepreneur') {
      await this.assertClubAccess(item.idClub, user);
      return;
    }
    throw new ForbiddenException('No autorizado para acceder a esta preferencia');
  }

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

  async findOne(id: number, user: RequestUser) {
    const item = await this.prisma.user_Club_Preferences.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Preferencia no encontrada');
    await this.assertPreferenceAccess(item, user);
    return sanitize(item);
  }

  async findByUser(idUser: number) {
    const preferences = await this.prisma.user_Club_Preferences.findMany({
      where: { idUser },
      orderBy: { updateDate: 'desc' },
    });
    return preferences.map(sanitize);
  }

  async findByClub(idClub: number, user: RequestUser) {
    await this.assertClubAccess(idClub, user);
    const preferences = await this.prisma.user_Club_Preferences.findMany({
      where: { idClub },
      orderBy: { updateDate: 'desc' },
    });
    return preferences.map(sanitize);
  }

  async findBySubscriptionType(idSubscriptionTypes: number, user: RequestUser) {
    const subType = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
    if (!subType) throw new NotFoundException('Tipo de suscripción no encontrado');
    await this.assertClubAccess(subType.idClub, user);

    const preferences = await this.prisma.user_Club_Preferences.findMany({
      where: { idSubscriptionTypes },
      orderBy: { updateDate: 'desc' },
    });
    return preferences.map(sanitize);
  }

  async update(id: number, dto: UpdateUserClubPreferenceDto, user: RequestUser) {
    const item = await this.prisma.user_Club_Preferences.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Preferencia no encontrada');
    await this.assertPreferenceAccess(item, user);

    if (dto.idUser) {
      const u = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
      if (!u) throw new NotFoundException('Usuario (nuevo) no encontrado');
    }
    if (dto.idClub) {
      const c = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
      if (!c) throw new NotFoundException('Club (nuevo) no encontrado');
    }
    if (dto.idSubscriptionTypes) {
      const st = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
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

  async remove(id: number, user: RequestUser) {
    const item = await this.prisma.user_Club_Preferences.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Preferencia no encontrada');
    await this.assertPreferenceAccess(item, user);
    await this.prisma.user_Club_Preferences.delete({ where: { id } });
    return { message: 'Preferencia eliminada correctamente' };
  }
}