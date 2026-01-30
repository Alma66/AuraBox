import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcryptjs';

function sanitize(admin: any) {
  if (!admin) return admin;
  if (admin.createdAt instanceof Date) admin.createdAt = admin.createdAt.toISOString();
  if (admin.updatedAt instanceof Date) admin.updatedAt = admin.updatedAt.toISOString();
  return admin;
}

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  private SALT_ROUNDS = 10;

  async create(dto: CreateAdminDto) {
    const exists = await this.prisma.admins.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Ya existe un admin con ese email');

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const created = await this.prisma.admins.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,  
        phoneNumber: dto.phoneNumber,  
        notes: dto.notes ?? null,
        active: dto.active ?? true,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const admins = await this.prisma.admins.findMany({ orderBy: { createdAt: 'desc' } });
    return admins.map(sanitize);
  }

  async findOne(id: number) {
    const item = await this.prisma.admins.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Admin no encontrado');
    return sanitize(item);
  }

  async findByEmail(email: string) {
    const item = await this.prisma.admins.findUnique({ where: { email } });
    if (!item) throw new NotFoundException('Admin no encontrado por email');
    return sanitize(item);
  }

  async update(id: number, dto: UpdateAdminDto) {
    const item = await this.prisma.admins.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Admin no encontrado');

    let data: any = { ...dto };
    if ((dto as any).password) {
      data.passwordHash = await bcrypt.hash((dto as any).password, this.SALT_ROUNDS);
      delete data.password;
    }

    const updated = await this.prisma.admins.update({
      where: { id },
      data,
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const item = await this.prisma.admins.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Admin no encontrado');
    await this.prisma.admins.delete({ where: { id } });
    return { message: 'Admin eliminado correctamente' };
  }
}