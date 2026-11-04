import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

const ADMIN_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  documentType: true,
  documentNumber: true,
  phoneNumber: true,
  active: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AdminsSelect;

function sanitize(admin: any) {
  if (!admin) return admin;
  if (admin.createdAt instanceof Date) admin.createdAt = admin.createdAt.toISOString();
  if (admin.updatedAt instanceof Date) admin.updatedAt = admin.updatedAt.toISOString();
  return admin;
}

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  private async emailTaken(email: string) {
    const where = { email: { equals: email, mode: 'insensitive' as const } };
    const [admin, user, entrepreneur] = await Promise.all([
      this.prisma.admins.findFirst({ where, select: { id: true } }),
      this.prisma.user.findFirst({ where, select: { id: true } }),
      this.prisma.entrepreneurs.findFirst({ where, select: { id: true } }),
    ]);
    return !!(admin || user || entrepreneur);
  }

  async create(dto: CreateAdminDto) {
    const email = dto.email.trim().toLowerCase();

    if (await this.emailTaken(email)) {
      throw new BadRequestException('Ese email ya está registrado en la plataforma');
    }

    const documentTaken = await this.prisma.admins.findUnique({
      where: { documentNumber: dto.documentNumber },
      select: { id: true },
    });
    if (documentTaken) throw new BadRequestException('Ya existe un admin con ese documento');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      const created = await this.prisma.admins.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email,
          passwordHash,
          documentType: dto.documentType,
          documentNumber: dto.documentNumber,
          phoneNumber: dto.phoneNumber ?? null,
          notes: dto.notes?.trim() || null,
          active: true,
        },
        select: ADMIN_SELECT,
      });
      return sanitize(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Ya existe un admin con ese email o documento');
      }
      throw error;
    }
  }

  async findAll() {
    const admins = await this.prisma.admins.findMany({
      orderBy: { createdAt: 'desc' },
      select: ADMIN_SELECT,
    });
    return admins.map(sanitize);
  }

  async findOne(id: number) {
    const item = await this.prisma.admins.findUnique({ where: { id }, select: ADMIN_SELECT });
    if (!item) throw new NotFoundException('Admin no encontrado');
    return sanitize(item);
  }

  async findByEmail(email: string) {
    const item = await this.prisma.admins.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
      select: ADMIN_SELECT,
    });
    if (!item) throw new NotFoundException('Admin no encontrado por email');
    return sanitize(item);
  }

  async update(id: number, dto: UpdateAdminDto) {
    const exists = await this.prisma.admins.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Admin no encontrado');

    const updated = await this.prisma.admins.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName.trim() } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName.trim() } : {}),
        ...(dto.phoneNumber !== undefined ? { phoneNumber: dto.phoneNumber } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {}),
        updatedAt: new Date(),
      },
      select: ADMIN_SELECT,
    });
    return sanitize(updated);
  }

  async setActive(id: number, active: boolean, requesterId: number) {
    const target = await this.prisma.admins.findUnique({ where: { id }, select: { id: true, active: true } });
    if (!target) throw new NotFoundException('Admin no encontrado');

    if (!active) {
      if (id === requesterId) {
        throw new BadRequestException('No podés desactivar tu propia cuenta');
      }
      const otherActive = await this.prisma.admins.count({ where: { active: true, id: { not: id } } });
      if (otherActive === 0) {
        throw new BadRequestException('Tiene que quedar al menos un administrador activo');
      }
    }

    const updated = await this.prisma.admins.update({
      where: { id },
      data: { active, updatedAt: new Date() },
      select: ADMIN_SELECT,
    });
    return sanitize(updated);
  }

  async setPassword(id: number, password: string) {
    const exists = await this.prisma.admins.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Admin no encontrado');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await this.prisma.admins.update({
      where: { id },
      data: { passwordHash, updatedAt: new Date() },
    });
    return { message: 'Contraseña actualizada correctamente' };
  }
}