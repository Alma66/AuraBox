import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { NotificationsService } from './notifications.service';
import { codeFromMethodName } from '../payments/payments.constants';
import { priceFor } from '../../common/utils/billing';

const DAY_MS = 24 * 60 * 60 * 1000;
const RUN_EVERY_MS = 60 * 60 * 1000;
const FIRST_RUN_DELAY_MS = 30 * 1000;
const BATCH_SIZE = 500;
const MAX_EMAILS_PER_RUN = 100;
const THRESHOLDS = [1, 3, 7];

export interface RemindersRunResult {
  notified: number;
  emailed: number;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatMoney = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(value);

const formatDate = (value: Date) =>
  value.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });

@Injectable()
export class RemindersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RemindersService.name);
  private timer: NodeJS.Timeout | null = null;
  private firstRun: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly mailer: MailerService,
  ) {}

  onModuleInit() {
    if (process.env.REMINDERS_CRON === 'off') return;
    this.firstRun = setTimeout(() => this.run(), FIRST_RUN_DELAY_MS);
    this.timer = setInterval(() => this.run(), RUN_EVERY_MS);
    this.firstRun.unref();
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.firstRun) clearTimeout(this.firstRun);
    if (this.timer) clearInterval(this.timer);
  }

  async run(): Promise<RemindersRunResult> {
    if (this.running) return { notified: 0, emailed: 0 };
    this.running = true;
    try {
      const result = await this.sendRenewalReminders();
      if (result.notified > 0) {
        this.logger.log(`Recordatorios de renovación: ${result.notified} avisos, ${result.emailed} emails`);
      }
      return result;
    } catch (error) {
      this.logger.error('Error al procesar los recordatorios de renovación', error as Error);
      return { notified: 0, emailed: 0 };
    } finally {
      this.running = false;
    }
  }

  async sendRenewalReminders(): Promise<RemindersRunResult> {
    const now = new Date();
    const horizon = new Date(now.getTime() + THRESHOLDS[THRESHOLDS.length - 1] * DAY_MS);
    let notified = 0;
    let emailed = 0;

    const subscriptions = await this.prisma.user_Subscriptions.findMany({
      where: { subscriptionStatus: 'Activa' as any, nextPaymentDate: { gt: now, lte: horizon } },
      orderBy: { nextPaymentDate: 'asc' },
      take: BATCH_SIZE,
    });
    if (subscriptions.length === 0) return { notified, emailed };

    const plans = await this.prisma.subscription_Types.findMany({
      where: { id: { in: Array.from(new Set(subscriptions.map((sub) => sub.idSubscriptionTypes))) } },
    });
    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(new Set(subscriptions.map((sub) => sub.idUser))) }, active: true },
      select: { id: true, firstName: true, email: true },
    });
    const methodIds = Array.from(
      new Set(subscriptions.map((sub) => sub.idPaymentMethods).filter((id): id is number => typeof id === 'number')),
    );
    const methods = methodIds.length
      ? await this.prisma.payment_Methods.findMany({ where: { id: { in: methodIds } } })
      : [];

    const planById = new Map(plans.map((plan) => [plan.id, plan] as [number, typeof plan]));
    const userById = new Map(users.map((user) => [user.id, user] as [number, typeof user]));
    const methodById = new Map(methods.map((method) => [method.id, method] as [number, typeof method]));
    const siteUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const emailsEnabled = process.env.REMINDER_EMAILS !== 'off';

    for (const sub of subscriptions) {
      const due = sub.nextPaymentDate;
      const plan = planById.get(sub.idSubscriptionTypes);
      const user = userById.get(sub.idUser);
      if (!due || !plan || !user) continue;

      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / DAY_MS);
      const threshold = THRESHOLDS.find((value) => daysLeft <= value);
      if (!threshold) continue;

      const method = sub.idPaymentMethods ? methodById.get(sub.idPaymentMethods) : undefined;
      const code = method ? codeFromMethodName(method.method) : null;
      const amount = priceFor(plan, code);
      const when = daysLeft <= 1 ? 'mañana' : `en ${daysLeft} días`;
      const dueLabel = formatDate(due);
      const payNote =
        code === 'efectivo'
          ? 'Abonás en efectivo cuando recibas tu caja.'
          : Number.isFinite(amount)
            ? `Se cobrará ${formatMoney(amount)}.`
            : '';
      const title = `Tu suscripción se renueva ${when}`;
      const message = `"${plan.name}" se renueva ${when} (${dueLabel}). ${payNote}`.trim();

      const created = await this.notifications.notify({
        idUser: user.id,
        type: 'renewal',
        title,
        message,
        link: '/customer/subscriptions',
        dedupeKey: `renewal:${sub.id}:${due.toISOString().slice(0, 10)}:${threshold}`,
      });
      if (!created) continue;
      notified += 1;

      if (emailsEnabled && emailed < MAX_EMAILS_PER_RUN && user.email) {
        const html = `<div style="font-family:Arial,sans-serif;color:#1F3350;max-width:480px;margin:0 auto">
<h2 style="margin:0 0 12px">Hola ${escapeHtml(user.firstName)}</h2>
<p style="margin:0 0 12px">Tu suscripción <strong>${escapeHtml(plan.name)}</strong> se renueva ${when}, el ${escapeHtml(dueLabel)}.</p>
<p style="margin:0 0 20px">${escapeHtml(payNote)}</p>
<p style="margin:0 0 20px"><a href="${siteUrl}/customer/subscriptions" style="background:#C1622B;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold;display:inline-block">Ver mis suscripciones</a></p>
<p style="margin:0;font-size:12px;color:#6b7a90">Si querés pausar o cancelar, podés hacerlo desde tu cuenta antes de la fecha de renovación.</p>
</div>`;
        const sent = await this.mailer.sendRaw(user.email, `${title} - AuraBox`, html);
        if (sent) emailed += 1;
      }
    }

    return { notified, emailed };
  }
}