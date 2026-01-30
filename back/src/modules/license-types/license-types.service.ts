import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLicenseTypeDto } from './dto/create-license-type.dto';
import { UpdateLicenseTypeDto } from './dto/update-license-type.dto';

@Injectable()
export class LicenseTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLicenseTypeDto) {
    const exists = await this.prisma.license_Types.findUnique({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Ya existe un tipo de licencia con ese nombre');

    return this.prisma.license_Types.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
      },
    });
  }

  async findAll() {
    return this.prisma.license_Types.findMany({ orderBy: { id: 'desc' } });
  }

  async findByName(name: string) {
    return this.prisma.license_Types.findUnique({ where: { name } });
  }

  async findOne(id: number) {
    const item = await this.prisma.license_Types.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Tipo de licencia no encontrado');
    return item;
  }

  async update(id: number, dto: UpdateLicenseTypeDto) {
    const item = await this.prisma.license_Types.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Tipo de licencia no encontrado');

    if (dto.name && dto.name !== item.name) {
      const dup = await this.prisma.license_Types.findUnique({ where: { name: dto.name } });
      if (dup) throw new ConflictException('Ya existe otro tipo de licencia con ese nombre');
    }

    return this.prisma.license_Types.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: number) {
    const item = await this.prisma.license_Types.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Tipo de licencia no encontrado');
    await this.prisma.license_Types.delete({ where: { id } });
    return { message: 'Tipo de licencia eliminado correctamente' };
  }
}