import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntrepreneurDto } from './dto/create-entrepreneurs.dto';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneurs.dto';
import * as bcrypt from 'bcryptjs';

function sanitize(entrepreneur: any) {
  if (!entrepreneur) return entrepreneur;
  if (entrepreneur.registrationDate instanceof Date) entrepreneur.registrationDate = entrepreneur.registrationDate.toISOString();
  if (entrepreneur.birthDate instanceof Date) entrepreneur.birthDate = entrepreneur.birthDate.toISOString();
  return entrepreneur;
}

@Injectable()
export class EntrepreneursService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEntrepreneurDto) {
    const exists = await this.prisma.entrepreneurs.findFirst({
      where: { OR: [{ email: dto.email }, { documentNumber: dto.documentNumber }] },
    });
    if (exists) throw new ConflictException('Email o documento ya registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const created = await this.prisma.entrepreneurs.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        cuitCuil: dto.cuitCuil ?? null,
        phoneNumber: dto.phoneNumber ?? null,
        birthDate: new Date(dto.birthDate),
        registrationDate: new Date(),
        city: dto.city ?? null,
        province: dto.province ?? null,
        active: dto.active ?? true,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const entrepreneurs = await this.prisma.entrepreneurs.findMany({
      orderBy: { id: 'asc' },
    });
    return entrepreneurs.map(sanitize);
  }

  async findOne(id: number) {
    const ent = await this.prisma.entrepreneurs.findUnique({ where: { id } });
    if (!ent) throw new NotFoundException('Emprendedor no encontrado');
    return sanitize(ent);
  }

  async findByEmail(email: string) {
    return this.prisma.entrepreneurs.findUnique({ where: { email } });
  }

  async update(id: number, dto: UpdateEntrepreneurDto) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id } });
    if (!entrepreneur) throw new NotFoundException('Emprendedor no encontrado');

    if ((dto as any).password) {
      (dto as any).passwordHash = await bcrypt.hash((dto as any).password, 10);
      delete (dto as any).password;
    }

    const data: any = { ...dto };
    if (data.birthDate) {
      data.birthDate = new Date(data.birthDate);
    }

    const updated = await this.prisma.entrepreneurs.update({
      where: { id },
      data,
    });
    return sanitize(updated);
  }

  async deactivate(id: number) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id } });
    if (!entrepreneur) throw new NotFoundException('Emprendedor no encontrado');

    const updated = await this.prisma.entrepreneurs.update({
      where: { id },
      data: { active: false },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id } });
    if (!entrepreneur) throw new NotFoundException('Emprendedor no encontrado');

    await this.prisma.entrepreneurs.delete({ where: { id } });
    return { message: 'Emprendedor eliminado correctamente' };
  }
}