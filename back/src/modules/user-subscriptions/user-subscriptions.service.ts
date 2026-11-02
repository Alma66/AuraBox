import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { Prisma } from '@prisma/client';
import { nextPaymentFrom } from '../../common/utils/billing';

type RequestUser = { id: number; role: string };

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  Activa: ['Pausada', 'Pendiente_Pago', 'Cancelada', 'Finalizada'],
  Pausada: ['Activa', 'Cancelada', 'Finalizada'],
  Pendiente_Pago: ['Activa', 'Cancelada'],
  Cancelada: [],
  Finalizada: [],
};

const CLOSED_STATUSES = ['Cancelada', 'Finalizada'];
const MAX_REASON_LENGTH = 500;

const cleanReason = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, MAX_REASON_LENGTH) : undefined;

const statusLabel = (value: string) => value.replace('_', ' ');

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

  private async assertEntrepreneurOwnsSubscription(idSubscriptionTypes: number, entrepreneurId: number) {
    const subType = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
    if (!subType) throw new NotFoundException('Tipo de suscripción no encontrado');
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub: subType.idClub, idEntrepreneurs: entrepreneurId },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a esta suscripción');
  }

  async create(dto: CreateUserSubscriptionDto, actingUser: RequestUser) {
    const userId = actingUser.role === 'admin' && dto.idUser ? dto.idUser : actingUser.id;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const sType = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
    if (!sType) throw new NotFoundException('Tipo de suscripción no encontrado');

    if (actingUser.role !== 'admin') {
      if (!sType.active) throw new BadRequestException('Este plan ya no está disponible');
      const club = await this.prisma.club.findUnique({ where: { id: sType.idClub } });
      if (!club || club.clubStatus !== 'APROBADO') throw new BadRequestException('Este club no está disponible');
    }

    if (dto.idPaymentMethods) {
      const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethods } });
      if (!pm) throw new NotFoundException('Método de pago no encontrado');
    }

    const existing = await this.prisma.user_Subscriptions.findFirst({
      where: {
        idUser: userId,
        idSubscriptionTypes: dto.idSubscriptionTypes,
        subscriptionStatus: { notIn: CLOSED_STATUSES as any },
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

  async findOneForRequester(id: number, user: RequestUser) {
    const sub = await this.findById(id);
    if (user.role === 'admin') return sub;
    if (user.role === 'customer' && sub.idUser === user.id) return sub;
    if (user.role === 'entrepreneur') {
      await this.assertEntrepreneurOwnsSubscription(sub.idSubscriptionTypes, user.id);
      return sub;
    }
    throw new ForbiddenException('No autorizado para ver esta suscripción');
  }

  async findByUser(userId: number) {
    const rows = await this.prisma.user_Subscriptions.findMany({
      where: { idUser: userId },
      orderBy: { startDate: 'desc' },
    });
    return rows.map((r) => sanitize(r));
  }

  async updateForRequester(id: number, dto: UpdateUserSubscriptionDto, user: RequestUser) {
    const existing = await this.prisma.user_Subscriptions.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Suscripción no encontrada');

    if (user.role === 'entrepreneur') {
      await this.assertEntrepreneurOwnsSubscription(existing.idSubscriptionTypes, user.id);

      const next = dto.subscriptionStatus;
      if (next !== undefined && next !== existing.subscriptionStatus) {
        const allowed = ALLOWED_TRANSITIONS[existing.subscriptionStatus] ?? [];
        if (!allowed.includes(next)) {
          throw new BadRequestException(
            `No se puede pasar una suscripción de ${statusLabel(existing.subscriptionStatus)} a ${statusLabel(next)}`,
          );
        }
      }

      return this.update(id, {
        subscriptionStatus: dto.subscriptionStatus,
        cancellationReason: cleanReason(dto.cancellationReason),
      });
    }

    return this.update(id, dto);
  }

    async update(id: number, dto: UpdateUserSubscriptionDto) {
    const existing = await this.prisma.user_Subscriptions.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Suscripción no encontrada');

    const data: Prisma.User_SubscriptionsUpdateInput = {};
    if (dto.subscriptionStatus !== undefined) data.subscriptionStatus = dto.subscriptionStatus as any;
    if (dto.lastPaymentDate !== undefined) data.lastPaymentDate = dto.lastPaymentDate as any;
    if (dto.nextPaymentDate !== undefined) data.nextPaymentDate = dto.nextPaymentDate as any;
    if (dto.monthlyAmountPaid !== undefined) data.monthlyAmountPaid = dto.monthlyAmountPaid as any;
    if (dto.cancellationReason !== undefined) data.cancellationReason = dto.cancellationReason;
    if (dto.cancellationDate !== undefined) data.cancellationDate = dto.cancellationDate as any;

    const next = dto.subscriptionStatus;
    const wasPending = existing.subscriptionStatus === 'Pendiente_Pago';
    const now = new Date();
    let paymentUpdate: Prisma.PrismaPromise<unknown> | null = null;

    if (next === 'Cancelada' && existing.subscriptionStatus !== 'Cancelada') {
      data.cancellationDate = dto.cancellationDate ?? now;
    } else if (next !== undefined && next !== 'Cancelada' && existing.subscriptionStatus === 'Cancelada') {
      data.cancellationDate = null;
      data.cancellationReason = null;
    }

    if (wasPending && (next === 'Activa' || next === 'Cancelada')) {
      const pendingPayment = await this.prisma.payment.findFirst({
        where: { idUserSubscription: id, paymentStatus: 'Pendiente' as any },
        orderBy: { paymentDate: 'desc' },
      });

      if (pendingPayment) {
        if (next === 'Activa') {
          paymentUpdate = this.prisma.payment.update({
            where: { id: pendingPayment.id },
            data: { paymentStatus: 'Exitoso' as any, paymentDate: now },
          });
          if (data.monthlyAmountPaid === undefined) {
            data.monthlyAmountPaid = pendingPayment.totalAmountPaid.toString();
          }
        } else {
          paymentUpdate = this.prisma.payment.update({
            where: { id: pendingPayment.id },
            data: { paymentStatus: 'Rechazado' as any },
          });
        }
      }

      if (next === 'Activa') {
        const plan = await this.prisma.subscription_Types.findUnique({ where: { id: existing.idSubscriptionTypes } });
        if (data.lastPaymentDate === undefined) data.lastPaymentDate = now;
        if (data.nextPaymentDate === undefined && plan) {
          const upcoming = nextPaymentFrom(now, plan.frequency);
          if (upcoming) data.nextPaymentDate = upcoming;
        }
      }
    }

    const subscriptionUpdate = this.prisma.user_Subscriptions.update({ where: { id }, data });

    if (paymentUpdate) {
      const [updated] = await this.prisma.$transaction([subscriptionUpdate, paymentUpdate]);
      return sanitize(updated);
    }

    const updated = await subscriptionUpdate;
    return sanitize(updated);
  }

  async cancel(id: number, reason?: unknown) {
    const existing = await this.prisma.user_Subscriptions.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Suscripción no encontrada');
    if (CLOSED_STATUSES.includes(existing.subscriptionStatus)) {
      throw new BadRequestException('Esta suscripción ya está cerrada');
    }

    const updated = await this.prisma.user_Subscriptions.update({
      where: { id },
      data: {
        subscriptionStatus: 'Cancelada' as any,
        cancellationReason: cleanReason(reason),
        cancellationDate: new Date(),
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    try {
      await this.prisma.user_Subscriptions.delete({ where: { id } });
      return { ok: true };
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('Suscripción no encontrada');
      }
      throw err;
    }
  }
}