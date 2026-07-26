import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubPaymentMethodDto } from './dto/create-club-payment-method.dto';
import { UpdateClubPaymentMethodDto } from './dto/update-club-payment-method.dto';

type RequestUser = { id: number; role: string };

@Injectable()
export class ClubPaymentMethodService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertClubAccess(idClub: number, user: RequestUser) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  async create(dto: CreateClubPaymentMethodDto, user: RequestUser) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    await this.assertClubAccess(dto.idClub, user);

    const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethod } });
    if (!pm) throw new NotFoundException('Método de pago no encontrado');

    const exists = await this.prisma.club_Payment_Method.findFirst({
      where: { idClub: dto.idClub, idPaymentMethod: dto.idPaymentMethod },
    });
    if (exists) throw new ConflictException('La asociación club-método de pago ya existe');

    return this.prisma.club_Payment_Method.create({
      data: {
        idClub: dto.idClub,
        idPaymentMethod: dto.idPaymentMethod,
      },
    });
  }

  async findAll() {
    return this.prisma.club_Payment_Method.findMany({ orderBy: { id: 'desc' } });
  }

  async findByClub(idClub: number) {
    return this.prisma.club_Payment_Method.findMany({
      where: { idClub },
      orderBy: { id: 'desc' },
    });
  }

  async findByPaymentMethod(idPaymentMethod: number) {
    return this.prisma.club_Payment_Method.findMany({
      where: { idPaymentMethod },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.club_Payment_Method.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Asociación club-método de pago no encontrada');
    return item;
  }

  async update(id: number, dto: UpdateClubPaymentMethodDto) {
    const existing = await this.prisma.club_Payment_Method.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asociación club-método de pago no encontrada');

    if (dto.idClub) {
      const c = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
      if (!c) throw new NotFoundException('Club (nuevo) no encontrado');
    }
    if (dto.idPaymentMethod) {
      const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethod } });
      if (!pm) throw new NotFoundException('Método de pago (nuevo) no encontrado');
    }

    if (dto.idClub || dto.idPaymentMethod) {
      const newIdClub = dto.idClub ?? existing.idClub;
      const newIdPaymentMethod = dto.idPaymentMethod ?? existing.idPaymentMethod;
      const duplicate = await this.prisma.club_Payment_Method.findFirst({
        where: { idClub: newIdClub, idPaymentMethod: newIdPaymentMethod, NOT: { id } },
      });
      if (duplicate) throw new ConflictException('Otra asociación con esos valores ya existe');
    }

    return this.prisma.club_Payment_Method.update({
      where: { id },
      data: {
        idClub: dto.idClub ?? existing.idClub,
        idPaymentMethod: dto.idPaymentMethod ?? existing.idPaymentMethod,
      },
    });
  }

  async remove(id: number, user: RequestUser) {
    const existing = await this.prisma.club_Payment_Method.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asociación club-método de pago no encontrada');
    await this.assertClubAccess(existing.idClub, user);
    await this.prisma.club_Payment_Method.delete({ where: { id } });
    return { message: 'Asociación eliminada correctamente' };
  }
}