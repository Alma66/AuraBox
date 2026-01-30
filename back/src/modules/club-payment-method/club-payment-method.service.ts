import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubPaymentMethodDto } from './dto/create-club-payment-method.dto';
import { UpdateClubPaymentMethodDto } from './dto/update-club-payment-method.dto';

@Injectable()
export class ClubPaymentMethodService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClubPaymentMethodDto) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

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

    if ((dto as any).idClub) {
      const c = await this.prisma.club.findUnique({ where: { id: (dto as any).idClub } });
      if (!c) throw new NotFoundException('Club (nuevo) no encontrado');
    }
    if ((dto as any).idPaymentMethod) {
      const pm = await this.prisma.payment_Methods.findUnique({ where: { id: (dto as any).idPaymentMethod } });
      if (!pm) throw new NotFoundException('Método de pago (nuevo) no encontrado');
    }

    if ((dto as any).idClub || (dto as any).idPaymentMethod) {
      const newIdClub = (dto as any).idClub ?? existing.idClub;
      const newIdPaymentMethod = (dto as any).idPaymentMethod ?? existing.idPaymentMethod;
      const duplicate = await this.prisma.club_Payment_Method.findFirst({
        where: { idClub: newIdClub, idPaymentMethod: newIdPaymentMethod, NOT: { id } },
      });
      if (duplicate) throw new ConflictException('Otra asociación con esos valores ya existe');
    }

    return this.prisma.club_Payment_Method.update({
      where: { id },
      data: {
        idClub: (dto as any).idClub ?? existing.idClub,
        idPaymentMethod: (dto as any).idPaymentMethod ?? existing.idPaymentMethod,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.club_Payment_Method.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asociación club-método de pago no encontrada');
    await this.prisma.club_Payment_Method.delete({ where: { id } });
    return { message: 'Asociación eliminada correctamente' };
  }
}