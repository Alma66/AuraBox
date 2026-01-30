import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

function sanitize(role: any) {
  if (!role) return role;
  if (role.createdAt instanceof Date) role.createdAt = role.createdAt.toISOString();
  return role;
}

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const exists = await this.prisma.role.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException('Ya existe un rol con ese código');

    const created = await this.prisma.role.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        scope: dto.scope,
        createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({ orderBy: { createdAt: 'desc' } });
    return roles.map(sanitize);
  }

  async findByCode(code: string) {
    const role = await this.prisma.role.findUnique({ where: { code } });
    return role ? sanitize(role) : null;
  }

  async findOne(id: number) {
    const item = await this.prisma.role.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Rol no encontrado');
    return sanitize(item);
  }

  async update(id: number, dto: UpdateRoleDto) {
    const item = await this.prisma.role.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Rol no encontrado');

    if (dto.code && dto.code !== item.code) {
      const dup = await this.prisma.role.findUnique({ where: { code: dto.code } });
      if (dup) throw new ConflictException('Ya existe otro rol con ese código');
    }

    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        ...dto,
        createdAt: dto.createdAt ? new Date(dto.createdAt) : item.createdAt,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const item = await this.prisma.role.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Rol no encontrado');
    await this.prisma.role.delete({ where: { id } });
    return { message: 'Rol eliminado correctamente' };
  }
}