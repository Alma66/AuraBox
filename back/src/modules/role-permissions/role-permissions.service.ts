import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';

function sanitize(rolePermission: any) {
  if (!rolePermission) return rolePermission;
  if (rolePermission.grantedAt instanceof Date) rolePermission.grantedAt = rolePermission.grantedAt.toISOString();
  return rolePermission;
}

@Injectable()
export class RolePermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRolePermissionDto) {
    const role = await this.prisma.role.findUnique({ where: { id: dto.idRole } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const permission = await this.prisma.permissions.findUnique({ where: { id: dto.idPermissions } });
    if (!permission) throw new NotFoundException('Permiso no encontrado');

    const admin = await this.prisma.admins.findUnique({ where: { id: dto.grantedById } });
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.grantedById } });
    if (!admin && !entrepreneur) throw new NotFoundException('Usuario que otorga el permiso no encontrado');

    const exists = await this.prisma.role_Permissions.findFirst({
      where: {
        idRole: dto.idRole,
        idPermissions: dto.idPermissions,
      },
    });
    if (exists) throw new ConflictException('La asignación rol-permiso ya existe');

    const created = await this.prisma.role_Permissions.create({
      data: {
        idRole: dto.idRole,
        idPermissions: dto.idPermissions,
        grantedById: dto.grantedById,
        grantedAt: dto.grantedAt ? new Date(dto.grantedAt) : new Date(),
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const permissions = await this.prisma.role_Permissions.findMany({ orderBy: { grantedAt: 'desc' } });
    return permissions.map(sanitize);
  }

  async findByRole(idRole: number) {
    const permissions = await this.prisma.role_Permissions.findMany({
      where: { idRole },
      orderBy: { grantedAt: 'desc' },
    });
    return permissions.map(sanitize);
  }

  async findByPermission(idPermissions: number) {
    const permissions = await this.prisma.role_Permissions.findMany({
      where: { idPermissions },
      orderBy: { grantedAt: 'desc' },
    });
    return permissions.map(sanitize);
  }

  async findOne(id: number) {
    const item = await this.prisma.role_Permissions.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Asignación de permiso no encontrada');
    return sanitize(item);
  }

  async update(id: number, dto: UpdateRolePermissionDto) {
    const existing = await this.prisma.role_Permissions.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asignación de permiso no encontrada');

    if ((dto as any).idRole) {
      const r = await this.prisma.role.findUnique({ where: { id: (dto as any).idRole } });
      if (!r) throw new NotFoundException('Rol (nuevo) no encontrado');
    }
    if ((dto as any).idPermissions) {
      const p = await this.prisma.permissions.findUnique({ where: { id: (dto as any).idPermissions } });
      if (!p) throw new NotFoundException('Permiso (nuevo) no encontrado');
    }
    if ((dto as any).grantedById) {
      const admin = await this.prisma.admins.findUnique({ where: { id: (dto as any).grantedById } });
      const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: (dto as any).grantedById } });
      if (!admin && !entrepreneur) throw new NotFoundException('Usuario que otorga el permiso (nuevo) no encontrado');
    }

    const updated = await this.prisma.role_Permissions.update({
      where: { id },
      data: {
        ...dto,
        grantedAt: dto.grantedAt ? new Date(dto.grantedAt) : existing.grantedAt,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const existing = await this.prisma.role_Permissions.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asignación de permiso no encontrada');
    await this.prisma.role_Permissions.delete({ where: { id } });
    return { message: 'Asignación de permiso eliminada correctamente' };
  }
}