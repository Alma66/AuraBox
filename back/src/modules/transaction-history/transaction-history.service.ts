import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionHistoryDto } from './dto/create-transaction-history.dto';
import { UpdateTransactionHistoryDto } from './dto/update-transaction-history.dto';

type RequestUser = { id: number; role: string };

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

  private async assertClubAccess(idClub: number, user: RequestUser) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  private async resolveClubId(item: { idClub: number | null; idUserSubscriptions: number }) {
    if (item.idClub) return item.idClub;
    const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: item.idUserSubscriptions } });
    if (!sub) return null;
    const subType = await this.prisma.subscription_Types.findUnique({ where: { id: sub.idSubscriptionTypes } });
    return subType?.idClub ?? null;
  }

  private async assertTransactionAccess(
    item: { idUser: number; idClub: number | null; idUserSubscriptions: number },
    user: RequestUser,
  ) {
    if (user.role === 'admin') return;
    if (user.role === 'customer' && item.idUser === user.id) return;
    if (user.role === 'entrepreneur') {
      const clubId = await this.resolveClubId(item);
      if (clubId) {
        await this.assertClubAccess(clubId, user);
        return;
      }
    }
    throw new ForbiddenException('No autorizado para ver esta transacción');
  }

  async create(dto: CreateTransactionHistoryDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: dto.idUserSubscriptions } });
    if (!sub) throw new NotFoundException('Suscripción no encontrada');
    if (sub.idUser !== dto.idUser) throw new NotFoundException('La suscripción no pertenece a este usuario');

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

  async findOne(id: number, user: RequestUser) {
    const item = await this.prisma.transaction_History.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Registro de transacción no encontrado');
    await this.assertTransactionAccess(item, user);
    return sanitize(item);
  }

  async findByUser(idUser: number, user: RequestUser) {
    if (user.role !== 'admin' && user.id !== idUser) {
      throw new ForbiddenException('No autorizado para ver estas transacciones');
    }
    const histories = await this.prisma.transaction_History.findMany({
      where: { idUser },
      orderBy: { paymentDate: 'desc' },
    });
    return histories.map(sanitize);
  }

  async findBySubscription(idUserSubscriptions: number, user: RequestUser) {
    const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: idUserSubscriptions } });
    if (!sub) throw new NotFoundException('Suscripción no encontrada');
    if (user.role !== 'admin') {
      if (user.role === 'customer' && sub.idUser !== user.id) {
        throw new ForbiddenException('No autorizado para ver estas transacciones');
      }
      if (user.role === 'entrepreneur') {
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: sub.idSubscriptionTypes } });
        if (!subType) throw new NotFoundException('Tipo de suscripción no encontrado');
        await this.assertClubAccess(subType.idClub, user);
      }
    }
    const histories = await this.prisma.transaction_History.findMany({
      where: { idUserSubscriptions },
      orderBy: { paymentDate: 'desc' },
    });
    return histories.map(sanitize);
  }

  async findByClub(idClub: number, user: RequestUser) {
    await this.assertClubAccess(idClub, user);
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