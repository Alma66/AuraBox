import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { Prisma, DocumentType } from '@prisma/client';

function sanitizeUser(user: any) {
  if (!user) return user;
  const { passwordHash, ...rest } = user as any;

  if (rest.registrationDate instanceof Date) {
    rest.registrationDate = rest.registrationDate.toISOString();
  }

  if (rest.balanceAvailable !== undefined && rest.balanceAvailable !== null) {
    try {
      rest.balanceAvailable = (rest.balanceAvailable as any).toString();
    } catch {
    }
  }

  return rest;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    const data: Prisma.UserCreateInput = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash: hashed,
      documentType: dto.documentType as DocumentType,
      documentNumber: dto.documentNumber,
    };

    try {
      const user = await this.prisma.user.create({ data });
      return sanitizeUser(user);
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new BadRequestException('Email o número de documento ya registrado');
      }
      throw err;
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        documentType: true,
        documentNumber: true,
        registrationDate: true,
        balanceAvailable: true,
        phoneNumber: true,
        streetAddress: true,
        addressNumber: true,
        floorNumber: true,
        addressDetails: true,
        city: true,
        province: true,
        postalCode: true,
        active: true,
      },
    });

    return users.map((u) => sanitizeUser(u));
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        documentType: true,
        documentNumber: true,
        registrationDate: true,
        balanceAvailable: true,
        phoneNumber: true,
        streetAddress: true,
        addressNumber: true,
        floorNumber: true,
        addressDetails: true,
        city: true,
        province: true,
        postalCode: true,
        active: true,
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return sanitizeUser(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: any = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.documentType !== undefined) data.documentType = dto.documentType as DocumentType;
    if (dto.documentNumber !== undefined) data.documentNumber = dto.documentNumber;

    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          documentType: true,
          documentNumber: true,
          registrationDate: true,
          balanceAvailable: true,
          phoneNumber: true,
          streetAddress: true,
          addressNumber: true,
          floorNumber: true,
          addressDetails: true,
          city: true,
          province: true,
          postalCode: true,
          active: true,
        },
      });
      return sanitizeUser(updated);
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw err;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.user.delete({ where: { id } });
      return { ok: true };
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw err;
    }
  }
}