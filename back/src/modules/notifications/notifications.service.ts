import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { codeFromMethodName } from '../payments/payments.constants';
import { priceFor } from '../../common/utils/billing';

export interface NotifyInput {
  idUser: number;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  dedupeKey?: string | null;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async notify(input: NotifyInput): Promise<boolean> {
    try {
      await this.prisma.notification.create({
        data: {
          idUser: input.idUser,
          type: input.type,
          title: input.title,
          message: input.message,
          link: input.link ?? null,
          dedupeKey: input.dedupeKey ?? null,
        },
      });
      return true;
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') return false;
      this.logger.error(`No se pudo crear la notificación para el usuario ${input.idUser}`, error as Error);
      return false;
    }
  }

  async listForUser(idUser: number, limit?: number) {
    const take = Number.isFinite(limit) && limit && limit > 0 ? Math.min(Math.floor(limit), MAX_LIMIT) : DEFAULT_LIMIT;
    const items = await this.prisma.notification.findMany({
      where: { idUser },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        link: true,
        readAt: true,
        createdAt: true,
      },
    });
    return items.map((item) => ({
      ...item,
      readAt: item.readAt ? item.readAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  async unreadCount(idUser: number) {
    const count = await this.prisma.notification.count({ where: { idUser, readAt: null } });
    return { count };
  }

  async markRead(idUser: number, id: number) {
    const result = await this.prisma.notification.updateMany({
      where: { id, idUser, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  async markAllRead(idUser: number) {
    const result = await this.prisma.notification.updateMany({
      where: { idUser, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  async upcomingRenewals(idUser: number) {
    const now = new Date();
    const subscriptions = await this.prisma.user_Subscriptions.findMany({
      where: { idUser, subscriptionStatus: 'Activa' as any, nextPaymentDate: { gt: now } },
      orderBy: { nextPaymentDate: 'asc' },
      take: 20,
    });
    if (subscriptions.length === 0) return [];

    const plans = await this.prisma.subscription_Types.findMany({
      where: { id: { in: Array.from(new Set(subscriptions.map((sub) => sub.idSubscriptionTypes))) } },
    });
    const methodIds = Array.from(
      new Set(subscriptions.map((sub) => sub.idPaymentMethods).filter((id): id is number => typeof id === 'number')),
    );
    const methods = methodIds.length
      ? await this.prisma.payment_Methods.findMany({ where: { id: { in: methodIds } } })
      : [];
    const planById = new Map(plans.map((plan) => [plan.id, plan] as [number, typeof plan]));
    const methodById = new Map(methods.map((method) => [method.id, method] as [number, typeof method]));

    return subscriptions.flatMap((sub) => {
      const plan = planById.get(sub.idSubscriptionTypes);
      if (!plan || !sub.nextPaymentDate) return [];
      const method = sub.idPaymentMethods ? methodById.get(sub.idPaymentMethods) : undefined;
      const code = method ? codeFromMethodName(method.method) : null;
      return [
        {
          subscriptionId: sub.id,
          planName: plan.name,
          dueDate: sub.nextPaymentDate.toISOString(),
          amount: priceFor(plan, code),
          paymentMethod: code,
        },
      ];
    });
  }
}