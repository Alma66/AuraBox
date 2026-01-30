import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminOrEntrepreneurRoleDto } from './dto/create-admin-or-entrepreneur-role.dto';
import { UpdateAdminOrEntrepreneurRoleDto } from './dto/update-admin-or-entrepreneur-role.dto';

function sanitize(roleAssignment: any) {
  if (!roleAssignment) return roleAssignment;
  if (roleAssignment.assignedAt instanceof Date) roleAssignment.assignedAt = roleAssignment.assignedAt.toISOString();
  return roleAssignment;
}

@Injectable()
export class AdminOrEntrepreneurRoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAdminOrEntrepreneurRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id: dto.idRole } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    if (dto.assignedToType === 'Admins') {
      const admin = await this.prisma.admins.findUnique({ where: { id: dto.assignedTo } });
      if (!admin) throw new NotFoundException('Admin asignado no encontrado');
    } else if (dto.assignedToType === 'Entrepreneur') {
      const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.assignedTo } });
      if (!entrepreneur) throw new NotFoundException('Emprendedor asignado no encontrado');
    }

    if (dto.assignedByType === 'Admins') {
      const adminBy = await this.prisma.admins.findUnique({ where: { id: dto.assignedBy } });
      if (!adminBy) throw new NotFoundException('Admin asignador no encontrado');
    } else if (dto.assignedByType === 'Entrepreneur') {
      const entrepreneurBy = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.assignedBy } });
      if (!entrepreneurBy) throw new NotFoundException('Emprendedor asignador no encontrado');
    }

    const created = await this.prisma.adminOrEntrepreneurRole.create({
      data: {
        idRole: dto.idRole,
        assignedToType: dto.assignedToType,
        assignedTo: dto.assignedTo,
        assignedByType: dto.assignedByType,
        assignedBy: dto.assignedBy,
        assignedAt: dto.assignedAt ? new Date(dto.assignedAt) : new Date(),
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const assignments = await this.prisma.adminOrEntrepreneurRole.findMany({ orderBy: { assignedAt: 'desc' } });
    return assignments.map(sanitize);
  }

  async findOne(id: number) {
    const item = await this.prisma.adminOrEntrepreneurRole.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Asignación no encontrada');
    return sanitize(item);
  }

  async findByAssignedTo(assignedTo: number) {
    const assignments = await this.prisma.adminOrEntrepreneurRole.findMany({
      where: { assignedTo },
      orderBy: { assignedAt: 'desc' },
    });
    return assignments.map(sanitize);
  }

  async findByRole(idRole: number) {
    const assignments = await this.prisma.adminOrEntrepreneurRole.findMany({
      where: { idRole },
      orderBy: { assignedAt: 'desc' },
    });
    return assignments.map(sanitize);
  }

  async update(id: number, dto: UpdateAdminOrEntrepreneurRoleDto) {
    const existing = await this.prisma.adminOrEntrepreneurRole.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asignación no encontrada');

    if ((dto as any).idRole) {
      const r = await this.prisma.role.findUnique({ where: { id: (dto as any).idRole } });
      if (!r) throw new NotFoundException('Rol (nuevo) no encontrado');
    }
    if ((dto as any).assignedTo && (dto as any).assignedToType) {
      if ((dto as any).assignedToType === 'Admins') {
        const a = await this.prisma.admins.findUnique({ where: { id: (dto as any).assignedTo } });
        if (!a) throw new NotFoundException('Admin asignado (nuevo) no encontrado');
      } else if ((dto as any).assignedToType === 'Entrepreneur') {
        const e = await this.prisma.entrepreneurs.findUnique({ where: { id: (dto as any).assignedTo } });
        if (!e) throw new NotFoundException('Emprendedor asignado (nuevo) no encontrado');
      }
    }
    if ((dto as any).assignedBy && (dto as any).assignedByType) {
      if ((dto as any).assignedByType === 'Admins') {
        const ab = await this.prisma.admins.findUnique({ where: { id: (dto as any).assignedBy } });
        if (!ab) throw new NotFoundException('Admin asignador (nuevo) no encontrado');
      } else if ((dto as any).assignedByType === 'Entrepreneur') {
        const eb = await this.prisma.entrepreneurs.findUnique({ where: { id: (dto as any).assignedBy } });
        if (!eb) throw new NotFoundException('Emprendedor asignador (nuevo) no encontrado');
      }
    }

    const updated = await this.prisma.adminOrEntrepreneurRole.update({
      where: { id },
      data: {
        ...dto,
        assignedAt: dto.assignedAt ? new Date(dto.assignedAt) : existing.assignedAt,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const existing = await this.prisma.adminOrEntrepreneurRole.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asignación no encontrada');
    await this.prisma.adminOrEntrepreneurRole.delete({ where: { id } });
    return { message: 'Asignación eliminada correctamente' };
  }
}