import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntrepreneurDto } from './dto/create-entrepreneurs.dto';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneurs.dto';
import * as bcrypt from 'bcryptjs';

function sanitize(entrepreneur: any) {
  if (!entrepreneur) return entrepreneur;
  const { passwordHash, ...rest } = entrepreneur;
  if (rest.registrationDate instanceof Date) rest.registrationDate = rest.registrationDate.toISOString();
  if (rest.birthDate instanceof Date) rest.birthDate = rest.birthDate.toISOString();
  if (rest.cuitCuil !== undefined && rest.cuitCuil !== null) {
    rest.cuitCuil = rest.cuitCuil.toString();
  }
  return rest;
}

@Injectable()
export class EntrepreneursService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEntrepreneurDto) {
    const exists = await this.prisma.entrepreneurs.findFirst({
      where: { OR: [{ email: dto.email }, { documentNumber: dto.documentNumber }] },
    });
    if (exists) throw new ConflictException('Email o documento ya registrado');

    const birthDate = new Date(dto.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) throw new BadRequestException('Debes tener al menos 18 años para registrarte como emprendedor.');

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
        birthDate,
        registrationDate: new Date(),
        city: dto.city ?? null,
        province: dto.province ?? null,
        active: dto.active ?? true,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const entrepreneurs = await this.prisma.entrepreneurs.findMany({ orderBy: { id: 'asc' } });
    return entrepreneurs.map(sanitize);
  }

  async findOne(id: number) {
    const ent = await this.prisma.entrepreneurs.findUnique({ where: { id } });
    if (!ent) throw new NotFoundException('Emprendedor no encontrado');

    const association = await this.prisma.entrepreneur_Club.findFirst({
      where: { idEntrepreneurs: id },
      orderBy: { associationDate: 'asc' },
    });

    return {
      ...sanitize(ent),
      managedClubId: association?.idClub ?? null,
    };
  }

  async findByEmail(email: string) {
    return this.prisma.entrepreneurs.findUnique({ where: { email } });
  }

  async update(id: number, dto: UpdateEntrepreneurDto) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id } });
    if (!entrepreneur) throw new NotFoundException('Emprendedor no encontrado');

    if (dto.email && dto.email !== entrepreneur.email) {
      const dup = await this.prisma.entrepreneurs.findUnique({ where: { email: dto.email } });
      if (dup) throw new ConflictException('Ese email ya está en uso');
    }
    if (dto.documentNumber && dto.documentNumber !== entrepreneur.documentNumber) {
      const dup = await this.prisma.entrepreneurs.findFirst({ where: { documentNumber: dto.documentNumber } });
      if (dup) throw new ConflictException('Ese documento ya está en uso');
    }

    const data: any = { ...dto };
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    if (data.birthDate) data.birthDate = new Date(data.birthDate);
    const updated = await this.prisma.entrepreneurs.update({ where: { id }, data });
    return sanitize(updated);
  }

  async verifyPassword(id: number, password: string) {
    const ent = await this.prisma.entrepreneurs.findUnique({ where: { id } });
    if (!ent) throw new NotFoundException('Emprendedor no encontrado');
    const ok = await bcrypt.compare(password, ent.passwordHash);
    if (!ok) throw new UnauthorizedException('Contraseña incorrecta');
    return { ok: true };
  }

  async deactivate(id: number) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id } });
    if (!entrepreneur) throw new NotFoundException('Emprendedor no encontrado');
    const updated = await this.prisma.entrepreneurs.update({ where: { id }, data: { active: false } });
    return sanitize(updated);
  }

  async remove(id: number) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id } });
    if (!entrepreneur) throw new NotFoundException('Emprendedor no encontrado');
    await this.prisma.entrepreneurs.delete({ where: { id } });
    return { message: 'Emprendedor eliminado correctamente' };
  }
}