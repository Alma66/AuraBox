import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';

function sanitize(favorite: any) {
  if (!favorite) return favorite;
  if (favorite.dateAdded instanceof Date) favorite.dateAdded = favorite.dateAdded.toISOString();
  return favorite;
}

function mapPlan(p: any) {
  let includes: string[] = [];
  if (p.includes) {
    try {
      includes = JSON.parse(p.includes);
    } catch {
      includes = [];
    }
  }
  return {
    planId: p.id,
    name: p.name,
    description: p.description,
    price: p.basePrice ? Number(p.basePrice) : 0,
    currency: 'ARS',
    deliveryFrequency: p.frequency,
    image: p.imageUrl ?? '',
    includes,
    active: p.active,
    cashDiscount: p.cashDiscount ? Number(p.cashDiscount) : 0,
    transferDiscount: p.transferDiscount ? Number(p.transferDiscount) : 0,
  };
}

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFavoriteDto & { idUser: number }) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const plan = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
    if (!plan) throw new NotFoundException('Plan de suscripción no encontrado');
    const existing = await this.prisma.favorites.findFirst({
      where: { idUser: dto.idUser, idSubscriptionTypes: dto.idSubscriptionTypes },
    });
    if (existing) throw new BadRequestException('Ya tienes este plan en favoritos');
    const created = await this.prisma.favorites.create({
      data: {
        idUser: dto.idUser,
        idSubscriptionTypes: dto.idSubscriptionTypes,
        dateAdded: dto.dateAdded ? new Date(dto.dateAdded) : new Date(),
      },
    });
    return sanitize(created);
  }

  async toggle(idUser: number, idSubscriptionTypes: number) {
    const plan = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
    if (!plan) throw new NotFoundException('Plan de suscripción no encontrado');
    const existing = await this.prisma.favorites.findFirst({ where: { idUser, idSubscriptionTypes } });
    if (existing) {
      await this.prisma.favorites.delete({ where: { id: existing.id } });
      return { isFavorite: false };
    }
    await this.prisma.favorites.create({ data: { idUser, idSubscriptionTypes, dateAdded: new Date() } });
    return { isFavorite: true };
  }

  async check(idUser: number, idSubscriptionTypes: number) {
    const existing = await this.prisma.favorites.findFirst({ where: { idUser, idSubscriptionTypes } });
    return { isFavorite: !!existing };
  }

  async findAll() {
    const favorites = await this.prisma.favorites.findMany({ orderBy: { dateAdded: 'desc' } });
    return favorites.map(sanitize);
  }

  async findOne(id: number) {
    const favorite = await this.prisma.favorites.findUnique({ where: { id } });
    if (!favorite) throw new NotFoundException('Favorito no encontrado');
    return sanitize(favorite);
  }

  async findByUserEnriched(idUser: number) {
    const favorites = await this.prisma.favorites.findMany({
      where: { idUser },
      orderBy: { dateAdded: 'desc' },
    });
    if (favorites.length === 0) return [];

    const planIds = favorites.map((f) => f.idSubscriptionTypes);
    const plans = await this.prisma.subscription_Types.findMany({ where: { id: { in: planIds } } });
    const plansById = new Map(plans.map((p) => [p.id, p]));

    const clubIds = [...new Set(plans.map((p) => p.idClub))];
    const clubs = await this.prisma.club.findMany({ where: { id: { in: clubIds } } });
    const clubsById = new Map(clubs.map((c) => [c.id, c]));

    return favorites
      .map((fav) => {
        const plan = plansById.get(fav.idSubscriptionTypes);
        if (!plan) return null;
        const club = clubsById.get(plan.idClub);
        if (!club) return null;
        return {
          favoriteId: fav.id,
          idSubscriptionTypes: fav.idSubscriptionTypes,
          dateAdded: fav.dateAdded.toISOString(),
          plan: mapPlan(plan),
          club: {
            id: club.id,
            name: club.name,
            logoUrl: club.logoUrl,
            slogan: club.slogan,
          },
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null);
  }

  async findByPlan(idSubscriptionTypes: number) {
    const favorites = await this.prisma.favorites.findMany({
      where: { idSubscriptionTypes },
      orderBy: { dateAdded: 'desc' },
    });
    return favorites.map(sanitize);
  }

  async update(id: number, dto: UpdateFavoriteDto) {
    const favorite = await this.prisma.favorites.findUnique({ where: { id } });
    if (!favorite) throw new NotFoundException('Favorito no encontrado');
    const updated = await this.prisma.favorites.update({
      where: { id },
      data: {
        ...dto,
        dateAdded: dto.dateAdded ? new Date(dto.dateAdded) : favorite.dateAdded,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const favorite = await this.prisma.favorites.findUnique({ where: { id } });
    if (!favorite) throw new NotFoundException('Favorito no encontrado');
    await this.prisma.favorites.delete({ where: { id } });
    return { message: 'Favorito eliminado correctamente' };
  }
}