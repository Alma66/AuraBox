import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

function sanitize(permission: any) {
  if (!permission) return permission;
  if (permission.createdAt instanceof Date) permission.createdAt = permission.createdAt.toISOString();
  return permission;
}

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    const exists = await this.prisma.permissions.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException('Ya existe un permiso con ese código');

    const created = await this.prisma.permissions.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const permissions = await this.prisma.permissions.findMany({ orderBy: { createdAt: 'desc' } });
    return permissions.map(sanitize);
  }

  async findByCode(code: string) {
    const permission = await this.prisma.permissions.findUnique({ where: { code } });
    return permission ? sanitize(permission) : null;
  }

  async findOne(id: number) {
    const item = await this.prisma.permissions.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Permiso no encontrado');
    return sanitize(item);
  }

  async update(id: number, dto: UpdatePermissionDto) {
    const item = await this.prisma.permissions.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Permiso no encontrado');

    if (dto.code && dto.code !== item.code) {
      const dup = await this.prisma.permissions.findUnique({ where: { code: dto.code } });
      if (dup) throw new ConflictException('Ya existe otro permiso con ese código');
    }

    const updated = await this.prisma.permissions.update({
      where: { id },
      data: { ...dto },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const item = await this.prisma.permissions.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Permiso no encontrado');
    await this.prisma.permissions.delete({ where: { id } });
    return { message: 'Permiso eliminado correctamente' };
  }
}