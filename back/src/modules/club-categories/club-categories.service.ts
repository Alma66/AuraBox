import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubCategoryDto } from './dto/create-club-category.dto';
import { UpdateClubCategoryDto } from './dto/update-club-category.dto';

type RequestUser = { id: number; role: string };

@Injectable()
export class ClubCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertClubAccess(idClub: number, user: RequestUser) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  async create(dto: CreateClubCategoryDto, user: RequestUser) {
    const category = await this.prisma.categories.findUnique({ where: { id: dto.idCategories } });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    await this.assertClubAccess(dto.idClub, user);

    const exists = await this.prisma.club_Categories.findFirst({
      where: { idCategories: dto.idCategories, idClub: dto.idClub },
    });
    if (exists) throw new ConflictException('La relación categoría-club ya existe');

    return this.prisma.club_Categories.create({
      data: {
        idCategories: dto.idCategories,
        idClub: dto.idClub,
      },
    });
  }

  async findAll() {
    return this.prisma.club_Categories.findMany({ orderBy: { id: 'asc' } });
  }

  async findByClub(idClub: number) {
    return this.prisma.club_Categories.findMany({
      where: { idClub },
      orderBy: { id: 'asc' },
    });
  }

  async findByCategory(idCategory: number) {
    return this.prisma.club_Categories.findMany({
      where: { idCategories: idCategory },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.club_Categories.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Relación no encontrada');
    return item;
  }

  async update(id: number, dto: UpdateClubCategoryDto) {
    const existing = await this.prisma.club_Categories.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Relación no encontrada');

    if (dto.idCategories) {
      const c = await this.prisma.categories.findUnique({ where: { id: dto.idCategories } });
      if (!c) throw new NotFoundException('Categoría (nueva) no encontrada');
    }
    if (dto.idClub) {
      const cl = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
      if (!cl) throw new NotFoundException('Club (nuevo) no encontrado');
    }

    if (dto.idCategories || dto.idClub) {
      const newIdCategories = dto.idCategories ?? existing.idCategories;
      const newIdClub = dto.idClub ?? existing.idClub;
      const duplicate = await this.prisma.club_Categories.findFirst({
        where: { idCategories: newIdCategories, idClub: newIdClub, NOT: { id } },
      });
      if (duplicate) throw new ConflictException('Otra relación con esos valores ya existe');
    }

    return this.prisma.club_Categories.update({
      where: { id },
      data: {
        idCategories: dto.idCategories ?? existing.idCategories,
        idClub: dto.idClub ?? existing.idClub,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.club_Categories.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Relación no encontrada');
    await this.prisma.club_Categories.delete({ where: { id } });
    return { message: 'Relación eliminada correctamente' };
  }
}