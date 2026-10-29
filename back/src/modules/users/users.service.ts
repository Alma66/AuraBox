import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { Prisma, DocumentType } from '@prisma/client';

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  documentType: true,
  documentNumber: true,
  registrationDate: true,
  birthDate: true,
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
  acceptsNewsletter: true,
  gender: true,
  country: true,
  showGenderPublicly: true,
  homeLatitude: true,
  homeLongitude: true,
};

function sanitizeUser(user: any) {
  if (!user) return user;
  const { passwordHash, ...rest } = user as any;
  if (rest.registrationDate instanceof Date) {
    rest.registrationDate = rest.registrationDate.toISOString();
  }
  if (rest.birthDate instanceof Date) {
    rest.birthDate = rest.birthDate.toISOString();
  }
  if (rest.balanceAvailable !== undefined && rest.balanceAvailable !== null) {
    try { rest.balanceAvailable = (rest.balanceAvailable as any).toString(); } catch {}
  }
  if (rest.homeLatitude !== undefined && rest.homeLatitude !== null) {
    try { rest.homeLatitude = (rest.homeLatitude as any).toString(); } catch {}
  }
  if (rest.homeLongitude !== undefined && rest.homeLongitude !== null) {
    try { rest.homeLongitude = (rest.homeLongitude as any).toString(); } catch {}
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
      phoneNumber: dto.phoneNumber ?? null,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
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
    const users = await this.prisma.user.findMany({ select: USER_SELECT });
    return users.map(sanitizeUser);
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return sanitizeUser(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: any = {};
    if (dto.firstName !== undefined)     data.firstName     = dto.firstName;
    if (dto.lastName !== undefined)      data.lastName      = dto.lastName;
    if (dto.password)                    data.passwordHash  = await bcrypt.hash(dto.password, 10);
    if (dto.documentType !== undefined)  data.documentType  = dto.documentType as DocumentType;
    if (dto.documentNumber !== undefined) data.documentNumber = dto.documentNumber;
    if (dto.phoneNumber !== undefined)   data.phoneNumber   = dto.phoneNumber;
    if (dto.birthDate !== undefined)     data.birthDate     = new Date(dto.birthDate);
    if (dto.streetAddress !== undefined) data.streetAddress = dto.streetAddress;
    if (dto.addressNumber !== undefined) data.addressNumber = dto.addressNumber;
    if (dto.floorNumber !== undefined)   data.floorNumber   = dto.floorNumber;
    if (dto.addressDetails !== undefined) data.addressDetails = dto.addressDetails;
    if (dto.city !== undefined)          data.city          = dto.city;
    if (dto.province !== undefined)      data.province      = dto.province;
    if (dto.postalCode !== undefined)    data.postalCode    = dto.postalCode;
    if (dto.acceptsNewsletter !== undefined) data.acceptsNewsletter = dto.acceptsNewsletter;
    if (dto.gender !== undefined)        data.gender        = dto.gender;
    if (dto.country !== undefined)       data.country       = dto.country;
    if (dto.showGenderPublicly !== undefined) data.showGenderPublicly = dto.showGenderPublicly;
    if (dto.active !== undefined)        data.active        = dto.active;
    if (dto.latitude !== undefined)      data.homeLatitude  = dto.latitude;
    if (dto.longitude !== undefined)     data.homeLongitude = dto.longitude;

    try {
      const updated = await this.prisma.user.update({ where: { id }, data, select: USER_SELECT });
      return sanitizeUser(updated);
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw err;
    }
  }

  async verifyPassword(id: number, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Contraseña incorrecta');
    return { ok: true };
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

  async findSubscribersByClub(idClub: number) {
    const subTypes = await this.prisma.subscription_Types.findMany({
      where: { idClub },
      select: { id: true },
    });
    const subTypeIds = subTypes.map((s) => s.id);
    if (subTypeIds.length === 0) return [];

    const activeSubs = await this.prisma.user_Subscriptions.findMany({
      where: {
        idSubscriptionTypes: { in: subTypeIds },
        subscriptionStatus: 'Activa',
      },
      select: { idUser: true },
    });
    const userIds = Array.from(new Set(activeSubs.map((s) => s.idUser)));
    if (userIds.length === 0) return [];

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds }, acceptsNewsletter: true },
      select: USER_SELECT,
    });
    return users.map(sanitizeUser);
  }
    async findNewsletterRecipients(idClub: number, requester: { id: number; role: string }) {
    if (requester.role !== 'admin') {
      const link = await this.prisma.entrepreneur_Club.findFirst({
        where: { idClub, idEntrepreneurs: requester.id },
      });
      if (!link) throw new ForbiddenException('No tenés acceso a este club');
    }
    return this.findSubscribersByClub(idClub);
  }
}