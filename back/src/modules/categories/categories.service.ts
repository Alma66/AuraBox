import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const exists = await this.prisma.categories.findFirst({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('Ya existe una categoría con ese nombre');

    return this.prisma.categories.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.categories.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const cat = await this.prisma.categories.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existing = await this.prisma.categories.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Categoría no encontrada');

    if (dto.name && dto.name !== existing.name) {
      const dup = await this.prisma.categories.findFirst({ where: { name: dto.name } });
      if (dup) throw new ConflictException('Ya existe otra categoría con ese nombre');
    }

    return this.prisma.categories.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        description: dto.description ?? existing.description,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.categories.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Categoría no encontrada');

    await this.prisma.categories.delete({ where: { id } });
    return { message: 'Categoría eliminada correctamente' };
  }
}