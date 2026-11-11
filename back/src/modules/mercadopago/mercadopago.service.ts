import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { nextPaymentFrom } from '../../common/utils/billing';

const API_URL = 'https://api.mercadopago.com';
const PENDING_PREFIX = 'MPORD:';
const PENDING_TTL_MS = 24 * 60 * 60 * 1000;
const CLEANUP_EVERY_MS = 60 * 60 * 1000;
const CLEANUP_FIRST_DELAY_MS = 60 * 1000;
const UNPAID_REASON = 'Pago no completado en Mercado Pago';

export type MercadoPagoOutcome = 'approved' | 'pending' | 'rejected';

export interface PreferenceItem {
  id: string;
  title: string;
  amount: number;
}

export interface MercadoPagoResult {
  ref: string | null;
  status: MercadoPagoOutcome | 'unknown';
  mpStatus: string | null;
}

@Injectable()
export class MercadoPagoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MercadoPagoService.name);
  private timer: NodeJS.Timeout | null = null;
  private firstRun: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  onModuleInit() {
    if (!this.isEnabled()) {
      this.logger.log('Mercado Pago sin configurar: los pagos con Mercado Pago se simulan');
      return;
    }
    this.logger.log('Mercado Pago activo');
    this.firstRun = setTimeout(() => this.cleanupUnpaid(), CLEANUP_FIRST_DELAY_MS);
    this.timer = setInterval(() => this.cleanupUnpaid(), CLEANUP_EVERY_MS);
    this.firstRun.unref();
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.firstRun) clearTimeout(this.firstRun);
    if (this.timer) clearInterval(this.timer);
  }

  private get token() {
    return process.env.MERCADOPAGO_ACCESS_TOKEN || '';
  }

  isEnabled() {
    return this.token.length > 0;
  }

  pendingMarker(orderId: string, ref: string) {
    return `${PENDING_PREFIX}${orderId}:${ref}`;
  }

  private refWhere(ref: string) {
    return { idGatewayTransaction: { endsWith: `:${ref}` } };
  }

  private orderIdFromMarker(marker: string | null | undefined) {
    if (!marker) return null;
    const parts = marker.split(':');
    return parts.length >= 3 ? parts[1] : null;
  }

  private toCents(value: unknown) {
    return Math.round(Number(value) * 100);
  }

  private describeError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string } | undefined;
      return `${error.response?.status ?? 'sin respuesta'} ${data?.message ?? error.message}`;
    }
    return error instanceof Error ? error.message : String(error);
  }

  async createOrder(input: { ref: string; items: PreferenceItem[] }) {
    const frontend = (process.env.FRONTEND_URL || '').replace(/\/+$/, '');
    const items = input.items.map((item) => ({
      title: item.title.slice(0, 250),
      unit_price: (this.toCents(item.amount) / 100).toFixed(2),
      quantity: 1,
    }));
    const totalCents = input.items.reduce((sum, item) => sum + this.toCents(item.amount), 0);
    const body: Record<string, unknown> = {
      type: 'online',
      processing_mode: 'manual',
      total_amount: (totalCents / 100).toFixed(2),
      external_reference: input.ref,
      expiration_time: 'P1D',
      items,
    };
    if (frontend.startsWith('https://')) {
      const backUrl = `${frontend}/checkout/result`;
      body.config = {
        online: {
          success_url: backUrl,
          failure_url: backUrl,
          pending_url: backUrl,
          auto_return: 'approved',
        },
      };
    }

    try {
      const response = await axios.post(`${API_URL}/v1/orders`, body, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Idempotency-Key': input.ref,
        },
        timeout: 15000,
      });
      const checkoutUrl = response.data?.checkout_url as string | undefined;
      const orderId = response.data?.id as string | undefined;
      if (!checkoutUrl || !orderId) throw new Error('Respuesta sin checkout_url o id');
      return { checkoutUrl, orderId };
    } catch (error) {
      this.logger.error(`No se pudo crear la order de Mercado Pago: ${this.describeError(error)}`);
      throw new BadRequestException('No pudimos iniciar el pago con Mercado Pago. Intentá de nuevo en unos minutos.');
    }
  }

  private async fetchOrder(orderId: string) {
    try {
      const response = await axios.get(`${API_URL}/v1/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${this.token}` },
        timeout: 15000,
      });
      return response.data as {
        id: string;
        status: string;
        status_detail?: string;
        external_reference?: string | null;
        total_amount?: string | number;
        currency?: string;
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundException('Orden no encontrada en Mercado Pago');
      }
      this.logger.error(`No se pudo consultar la order ${orderId}: ${this.describeError(error)}`);
      throw new BadRequestException('No pudimos consultar el estado del pago. Intentá de nuevo en unos minutos.');
    }
  }

  private async outcomeFor(ref: string): Promise<MercadoPagoOutcome | 'unknown'> {
    const payments = await this.prisma.payment.findMany({ where: this.refWhere(ref), select: { paymentStatus: true } });
    if (payments.length === 0) return 'unknown';
    if (payments.every((payment) => payment.paymentStatus === ('Exitoso' as any))) return 'approved';
    if (payments.some((payment) => payment.paymentStatus === ('Rechazado' as any))) return 'rejected';
    return 'pending';
  }

  private async applyOrder(
    order: {
      id: string;
      status: string;
      external_reference?: string | null;
      total_amount?: string | number;
      currency?: string;
    },
    options: { userId?: number },
  ): Promise<MercadoPagoResult> {
    const ref = typeof order.external_reference === 'string' && order.external_reference ? order.external_reference : null;
    if (!ref) return { ref: null, status: 'unknown', mpStatus: order.status };

    const payments = await this.prisma.payment.findMany({ where: this.refWhere(ref) });
    if (payments.length === 0) return { ref, status: 'unknown', mpStatus: order.status };
    if (options.userId !== undefined && payments.some((payment) => payment.idUser !== options.userId)) {
      throw new ForbiddenException('Este pago no te pertenece');
    }
    if (payments.some((payment) => this.orderIdFromMarker(payment.idGatewayTransaction) !== order.id)) {
      this.logger.error(`La order ${order.id} no corresponde a la compra ${ref}`);
      return { ref, status: 'unknown', mpStatus: order.status };
    }

    if (order.status === 'processed') {
      const totalCents = payments.reduce((sum, payment) => sum + this.toCents(payment.totalAmountPaid), 0);
      if (this.toCents(order.total_amount) !== totalCents) {
        this.logger.error(`El monto de la order ${order.id} no coincide con la compra ${ref}`);
        return { ref, status: 'pending', mpStatus: order.status };
      }

      const now = new Date();
      let activated = 0;
      let owner = 0;
      for (const payment of payments) {
        if (payment.paymentStatus !== ('Pendiente' as any)) continue;
        const done = await this.prisma.$transaction(async (tx) => {
          const updated = await tx.payment.updateMany({
            where: { id: payment.id, paymentStatus: 'Pendiente' as any },
            data: {
              paymentStatus: 'Exitoso' as any,
              paymentDate: now,
              idGatewayTransaction: `MP:${order.id}:${ref}`,
            },
          });
          if (updated.count !== 1) return false;
          const sub = await tx.user_Subscriptions.findUnique({ where: { id: payment.idUserSubscription } });
          if (!sub) return true;
          const plan = await tx.subscription_Types.findUnique({ where: { id: sub.idSubscriptionTypes } });
          await tx.user_Subscriptions.update({
            where: { id: sub.id },
            data: {
              subscriptionStatus: 'Activa' as any,
              lastPaymentDate: now,
              nextPaymentDate: plan ? (nextPaymentFrom(now, plan.frequency) ?? undefined) : undefined,
              monthlyAmountPaid: payment.totalAmountPaid.toString(),
              cancellationReason: null,
              cancellationDate: null,
            },
          });
          return true;
        });
        if (done) {
          activated += 1;
          owner = payment.idUser;
        }
      }
      if (activated > 0) {
        await this.notifications.notify({
          idUser: owner,
          type: 'payment',
          title: 'Pago aprobado',
          message:
            activated === 1
              ? 'Mercado Pago aprobó tu pago y tu suscripción ya está activa.'
              : `Mercado Pago aprobó tu pago y tus ${activated} suscripciones ya están activas.`,
          link: '/customer/subscriptions',
          dedupeKey: `payment:${order.id}`,
        });
      }
    } else if (['failed', 'canceled', 'expired'].includes(order.status)) {
      const now = new Date();
      for (const payment of payments) {
        if (payment.paymentStatus !== ('Pendiente' as any)) continue;
        await this.prisma.$transaction(async (tx) => {
          const updated = await tx.payment.updateMany({
            where: { id: payment.id, paymentStatus: 'Pendiente' as any },
            data: { paymentStatus: 'Rechazado' as any },
          });
          if (updated.count !== 1) return;
          await tx.user_Subscriptions.updateMany({
            where: { id: payment.idUserSubscription, subscriptionStatus: 'Pendiente_Pago' as any },
            data: {
              subscriptionStatus: 'Cancelada' as any,
              cancellationReason:
                order.status === 'expired' ? UNPAID_REASON : 'Pago rechazado en Mercado Pago',
              cancellationDate: now,
            },
          });
        });
      }
    }

    return { ref, status: await this.outcomeFor(ref), mpStatus: order.status };
  }

  async handleWebhook(orderId: string) {
    if (!this.isEnabled()) return { ok: false };
    const order = await this.fetchOrder(orderId);
    const result = await this.applyOrder(order, {});
    return { ok: true, status: result.status };
  }

  async confirmForUser(userId: number, ref: string) {
    if (!this.isEnabled()) throw new BadRequestException('Mercado Pago no está configurado');
    const payments = await this.prisma.payment.findMany({
      where: this.refWhere(ref),
      select: { idUser: true, idGatewayTransaction: true },
    });
    if (payments.length === 0) throw new NotFoundException('Compra no encontrada');
    if (payments.some((payment) => payment.idUser !== userId)) throw new ForbiddenException('Esta compra no te pertenece');
    const orderId = this.orderIdFromMarker(payments[0].idGatewayTransaction);
    if (!orderId) throw new NotFoundException('Compra no encontrada');
    const order = await this.fetchOrder(orderId);
    return this.applyOrder(order, { userId });
  }

  async statusForUser(userId: number, ref: string) {
    const payments = await this.prisma.payment.findMany({
      where: this.refWhere(ref),
      select: { idUser: true },
    });
    if (payments.length === 0) throw new NotFoundException('Compra no encontrada');
    if (payments.some((payment) => payment.idUser !== userId)) throw new ForbiddenException('Esta compra no te pertenece');
    return { ref, status: await this.outcomeFor(ref) };
  }

  async cleanupUnpaid() {
    try {
      const limit = new Date(Date.now() - PENDING_TTL_MS);
      const stale = await this.prisma.payment.findMany({
        where: {
          paymentStatus: 'Pendiente' as any,
          idGatewayTransaction: { startsWith: PENDING_PREFIX },
          paymentDate: { lt: limit },
        },
        take: 200,
      });
      const now = new Date();
      for (const payment of stale) {
        await this.prisma.$transaction(async (tx) => {
          const updated = await tx.payment.updateMany({
            where: { id: payment.id, paymentStatus: 'Pendiente' as any },
            data: { paymentStatus: 'Rechazado' as any },
          });
          if (updated.count !== 1) return;
          await tx.user_Subscriptions.updateMany({
            where: { id: payment.idUserSubscription, subscriptionStatus: 'Pendiente_Pago' as any },
            data: {
              subscriptionStatus: 'Cancelada' as any,
              cancellationReason: UNPAID_REASON,
              cancellationDate: now,
            },
          });
        });
      }
      if (stale.length > 0) this.logger.log(`Compras de Mercado Pago sin pagar canceladas: ${stale.length}`);
    } catch (error) {
      this.logger.error('Error al limpiar pagos pendientes de Mercado Pago', error as Error);
    }
  }
}