import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionHistoryDto } from './dto/create-transaction-history.dto';
import { UpdateTransactionHistoryDto } from './dto/update-transaction-history.dto';

function sanitize(history: any) {
  if (!history) return history;
  ['totalAmountPaid', 'clubAmount', 'commissionAmount'].forEach((k) => {
    if (history[k] !== undefined && history[k] !== null) {
      try {
        history[k] = (history[k] as any).toString();
      } catch {}
    }
  });
  if (history.paymentDate instanceof Date) history.paymentDate = history.paymentDate.toISOString();
  return history;
}

@Injectable()
export class TransactionHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionHistoryDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: dto.idUserSubscriptions } });
    if (!sub) throw new NotFoundException('Suscripción no encontrada');

    if (dto.idClub) {
      const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
      if (!club) throw new NotFoundException('Club no encontrado');
    }

    if (dto.idPaymentMethods) {
      const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethods } });
      if (!pm) throw new NotFoundException('Método de pago no encontrado');
    }

    const created = await this.prisma.transaction_History.create({
      data: {
        idUser: dto.idUser,
        idUserSubscriptions: dto.idUserSubscriptions,
        idGatewayTransaction: dto.idGatewayTransaction,
        idClub: dto.idClub,
        idPaymentMethods: dto.idPaymentMethods,
        totalAmountPaid: dto.totalAmountPaid,
        clubAmount: dto.clubAmount,
        commissionAmount: dto.commissionAmount,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        paymentStatus: dto.paymentStatus,
        paymentNotes: dto.paymentNotes,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const histories = await this.prisma.transaction_History.findMany({ orderBy: { paymentDate: 'desc' } });
    return histories.map(sanitize);
  }

  async findOne(id: number) {
    const item = await this.prisma.transaction_History.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Registro de transacción no encontrado');
    return sanitize(item);
  }

  async findByUser(idUser: number) {
    const histories = await this.prisma.transaction_History.findMany({
      where: { idUser },
      orderBy: { paymentDate: 'desc' },
    });
    return histories.map(sanitize);
  }

  async findBySubscription(idUserSubscriptions: number) {
    const histories = await this.prisma.transaction_History.findMany({
      where: { idUserSubscriptions },
      orderBy: { paymentDate: 'desc' },
    });
    return histories.map(sanitize);
  }

  async findByClub(idClub: number) {
    const histories = await this.prisma.transaction_History.findMany({
      where: { idClub },
      orderBy: { paymentDate: 'desc' },
    });
    return histories.map(sanitize);
  }

  async update(id: number, dto: UpdateTransactionHistoryDto) {
    const item = await this.prisma.transaction_History.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Registro de transacción no encontrado');

    const updated = await this.prisma.transaction_History.update({
      where: { id },
      data: {
        ...dto,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : item.paymentDate,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const item = await this.prisma.transaction_History.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Registro de transacción no encontrado');
    await this.prisma.transaction_History.delete({ where: { id } });
    return { message: 'Registro de transacción eliminado correctamente' };
  }
}