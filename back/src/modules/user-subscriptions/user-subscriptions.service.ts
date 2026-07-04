import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { Prisma } from '@prisma/client';

function sanitize(sub: any) {
  if (!sub) return sub;
  if (sub.monthlyAmountPaid !== undefined && sub.monthlyAmountPaid !== null) {
    try {
      sub.monthlyAmountPaid = (sub.monthlyAmountPaid as any).toString();
    } catch {}
  }
  ['startDate','expectedEndDate','lastPaymentDate','nextPaymentDate','cancellationDate'].forEach((k) => {
    if (sub[k] instanceof Date) sub[k] = (sub[k] as Date).toISOString();
  });
  return sub;
}

@Injectable()
export class UserSubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserSubscriptionDto, actingUserId?: number) {
    const userId = dto.idUser ?? actingUserId;
    if (!userId) throw new BadRequestException('idUser no especificado');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const sType = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
    if (!sType) throw new NotFoundException('Tipo de suscripción no encontrado');

    if (dto.idPaymentMethods) {
      const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethods } });
      if (!pm) throw new NotFoundException('Método de pago no encontrado');
    }

    const existing = await this.prisma.user_Subscriptions.findFirst({
      where: {
        idUser: userId,
        idSubscriptionTypes: dto.idSubscriptionTypes,
        subscriptionStatus: { not: 'Cancelada' as any },
      },
    });
    if (existing) throw new BadRequestException('Ya tienes una suscripción activa a este tipo');

    const data: Prisma.User_SubscriptionsCreateInput = {
      idUser: userId,
      idPaymentMethods: dto.idPaymentMethods ?? undefined,
      idSubscriptionTypes: dto.idSubscriptionTypes,
      startDate: dto.startDate ?? new Date(),
      expectedEndDate: dto.expectedEndDate ?? undefined,
      subscriptionStatus: 'Activa' as any,
      lastPaymentDate: undefined,
      nextPaymentDate: undefined,
      monthlyAmountPaid: dto.monthlyAmountPaid ?? undefined,
      cancellationReason: dto.cancellationReason ?? undefined,
      cancellationDate: dto.cancellationDate ?? undefined,
    };

    const created = await this.prisma.user_Subscriptions.create({ data });
    return sanitize(created);
  }

  async findAll() {
    const rows = await this.prisma.user_Subscriptions.findMany({
      orderBy: { startDate: 'desc' },
    });
    return rows.map((r) => sanitize(r));
  }

  async findById(id: number) {
    const row = await this.prisma.user_Subscriptions.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Suscripción no encontrada');
    return sanitize(row);
  }

  async findByUser(userId: number) {
    const rows = await this.prisma.user_Subscriptions.findMany({
      where: { idUser: userId },
      orderBy: { startDate: 'desc' },
    });
    return rows.map((r) => sanitize(r));
  }

  async update(id: number, dto: UpdateUserSubscriptionDto, actingUserRole?: string) {
    const existing = await this.prisma.user_Subscriptions.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Suscripción no encontrada');

    const data: Prisma.User_SubscriptionsUpdateInput = {};
    if (dto.subscriptionStatus !== undefined) data.subscriptionStatus = dto.subscriptionStatus as any;
    if (dto.lastPaymentDate !== undefined) data.lastPaymentDate = dto.lastPaymentDate as any;
    if (dto.nextPaymentDate !== undefined) data.nextPaymentDate = dto.nextPaymentDate as any;
    if (dto.monthlyAmountPaid !== undefined) data.monthlyAmountPaid = dto.monthlyAmountPaid as any;
    if (dto.cancellationReason !== undefined) data.cancellationReason = dto.cancellationReason;
    if (dto.cancellationDate !== undefined) data.cancellationDate = dto.cancellationDate as any;

    const updated = await this.prisma.user_Subscriptions.update({
      where: { id },
      data,
    });
    return sanitize(updated);
  }

  async cancel(id: number, reason?: string) {
    const existing = await this.prisma.user_Subscriptions.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Suscripción no encontrada');

    const updated = await this.prisma.user_Subscriptions.update({
      where: { id },
      data: {
        subscriptionStatus: 'Cancelada' as any,
        cancellationReason: reason ?? undefined,
        cancellationDate: new Date(),
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    await this.prisma.user_Subscriptions.delete({ where: { id } });
    return { ok: true };
  }
}