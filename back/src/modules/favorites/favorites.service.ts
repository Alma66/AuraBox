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

  async create(dto: CreateFavoriteDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    const existing = await this.prisma.favorites.findFirst({
      where: { idUser: dto.idUser, idClub: dto.idClub },
    });
    if (existing) throw new BadRequestException('Ya tienes este club en favoritos');
    const created = await this.prisma.favorites.create({
      data: {
        idUser: dto.idUser,
        idClub: dto.idClub,
        dateAdded: dto.dateAdded ? new Date(dto.dateAdded) : new Date(),
      },
    });
    return sanitize(created);
  }

  async toggle(idUser: number, idClub: number) {
    const club = await this.prisma.club.findUnique({ where: { id: idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    const existing = await this.prisma.favorites.findFirst({ where: { idUser, idClub } });
    if (existing) {
      await this.prisma.favorites.delete({ where: { id: existing.id } });
      return { isFavorite: false };
    }
    await this.prisma.favorites.create({ data: { idUser, idClub, dateAdded: new Date() } });
    return { isFavorite: true };
  }

  async check(idUser: number, idClub: number) {
    const existing = await this.prisma.favorites.findFirst({ where: { idUser, idClub } });
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

  async findByUser(idUser: number) {
    const favorites = await this.prisma.favorites.findMany({
      where: { idUser },
      orderBy: { dateAdded: 'desc' },
    });
    return favorites.map(sanitize);
  }

  async findByUserEnriched(idUser: number) {
    const favorites = await this.prisma.favorites.findMany({
      where: { idUser },
      orderBy: { dateAdded: 'desc' },
    });
    if (favorites.length === 0) return [];

    const clubIds = favorites.map((f) => f.idClub);
    const clubs = await this.prisma.club.findMany({ where: { id: { in: clubIds } } });
    const clubsById = new Map(clubs.map((c) => [c.id, c]));

    const plans = await this.prisma.subscription_Types.findMany({
      where: { idClub: { in: clubIds }, active: true },
    });
    const plansByClubId = new Map<number, any[]>();
    plans.forEach((p) => {
      const list = plansByClubId.get(p.idClub) ?? [];
      list.push(mapPlan(p));
      plansByClubId.set(p.idClub, list);
    });

    return favorites
      .map((fav) => {
        const club = clubsById.get(fav.idClub);
        if (!club) return null;
        return {
          favoriteId: fav.id,
          idClub: fav.idClub,
          dateAdded: fav.dateAdded.toISOString(),
          club: {
            id: club.id,
            name: club.name,
            logoUrl: club.logoUrl,
            slogan: club.slogan,
            averageRating: club.averageRating ? club.averageRating.toString() : null,
            totalReviews: club.totalReviews,
            clubStatus: club.clubStatus,
          },
          plans: plansByClubId.get(fav.idClub) ?? [],
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null);
  }

  async findByClub(idClub: number) {
    const favorites = await this.prisma.favorites.findMany({
      where: { idClub },
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

  async removeByUserAndClub(idUser: number, idClub: number) {
    const favorite = await this.prisma.favorites.findFirst({ where: { idUser, idClub } });
    if (!favorite) throw new NotFoundException('Favorito no encontrado');
    await this.prisma.favorites.delete({ where: { id: favorite.id } });
    return { message: 'Favorito eliminado correctamente' };
  }

  async remove(id: number) {
    const favorite = await this.prisma.favorites.findUnique({ where: { id } });
    if (!favorite) throw new NotFoundException('Favorito no encontrado');
    await this.prisma.favorites.delete({ where: { id } });
    return { message: 'Favorito eliminado correctamente' };
  }
}