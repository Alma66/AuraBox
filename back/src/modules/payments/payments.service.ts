import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

function sanitize(payment: any) {
  if (!payment) return payment;
  ['totalAmountPaid', 'clubAmount', 'commissionAmount'].forEach((k) => {
    if (payment[k] !== undefined && payment[k] !== null) {
      try {
        payment[k] = (payment[k] as any).toString();
      } catch {}
    }
  });
  if (payment.paymentDate instanceof Date) payment.paymentDate = payment.paymentDate.toISOString();
  return payment;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: dto.idUserSubscription } });
    if (!sub) throw new NotFoundException('Suscripción no encontrada');

    const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    if (dto.idPaymentMethods) {
      const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethods } });
      if (!pm) throw new NotFoundException('Método de pago no encontrado');
    }

    const created = await this.prisma.payment.create({
      data: {
        idUserSubscription: dto.idUserSubscription,
        idUser: dto.idUser,
        idClub: dto.idClub,
        idGatewayTransaction: dto.idGatewayTransaction,
        idPaymentMethods: dto.idPaymentMethods,
        totalAmountPaid: dto.totalAmountPaid,
        clubAmount: dto.clubAmount,
        commissionAmount: dto.commissionAmount,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        paymentStatus: dto.paymentStatus,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const payments = await this.prisma.payment.findMany({
      orderBy: { paymentDate: 'desc' },
    });
    return payments.map(sanitize);
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return sanitize(payment);
  }

  async findByUser(idUser: number) {
    const payments = await this.prisma.payment.findMany({
      where: { idUser },
      orderBy: { paymentDate: 'desc' },
    });
    return payments.map(sanitize);
  }

  async findByClub(idClub: number) {
    const payments = await this.prisma.payment.findMany({
      where: { idClub },
      orderBy: { paymentDate: 'desc' },
    });
    return payments.map(sanitize);
  }

  async update(id: number, dto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Pago no encontrado');

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        ...dto,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : payment.paymentDate,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    await this.prisma.payment.delete({ where: { id } });
    return { message: 'Pago eliminado correctamente' };
  }
}