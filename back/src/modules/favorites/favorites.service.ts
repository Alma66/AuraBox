import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';

function sanitize(favorite: any) {
  if (!favorite) return favorite;
  if (favorite.dateAdded instanceof Date) favorite.dateAdded = favorite.dateAdded.toISOString();
  return favorite;
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

  async findAll() {
    const favorites = await this.prisma.favorites.findMany({
      orderBy: { dateAdded: 'desc' },
    });
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

  async remove(id: number) {
    const favorite = await this.prisma.favorites.findUnique({ where: { id } });
    if (!favorite) throw new NotFoundException('Favorito no encontrado');
    await this.prisma.favorites.delete({ where: { id } });
    return { message: 'Favorito eliminado correctamente' };
  }
}