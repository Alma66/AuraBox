import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';

const buildWelcomeHtml = (unsubscribeUrl: string) =>
  `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#1f2a44">
<h2 style="margin-bottom:8px">¡Bienvenido/a a las novedades de AuraBox!</h2>
<p>Te vas a enterar de clubes nuevos y promos exclusivas antes que nadie.</p>
<p style="font-size:12px;color:#6b7280">Si no fuiste vos o ya no querés recibir estos correos, podés <a href="${unsubscribeUrl}">darte de baja con un clic</a>.</p>
</div>`;

@Injectable()
export class NewsletterSubscriptionService {
  private readonly logger = new Logger(NewsletterSubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  private unsubscribeUrl(token: string) {
    const base = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    return `${base}/newsletter/unsubscribe?token=${token}`;
  }

  async subscribe(email: string) {
    const existing = await this.prisma.newsletter_Subscriber.findUnique({ where: { email } });
    if (existing && existing.isActive) return { ok: true };

    let token: string;
    if (existing) {
      await this.prisma.newsletter_Subscriber.update({
        where: { id: existing.id },
        data: { isActive: true, unsubscribedAt: null },
      });
      token = existing.unsubscribeToken;
    } else {
      token = randomBytes(24).toString('hex');
      try {
        await this.prisma.newsletter_Subscriber.create({ data: { email, unsubscribeToken: token } });
      } catch (error) {
        if ((error as { code?: string })?.code === 'P2002') return { ok: true };
        throw error;
      }
    }

    const sent = await this.mailer.sendRaw(
      email,
      'Ya estás suscripto/a a las novedades de AuraBox',
      buildWelcomeHtml(this.unsubscribeUrl(token)),
    );
    if (!sent) this.logger.warn('No se pudo enviar el correo de bienvenida del newsletter');
    return { ok: true };
  }

  async unsubscribe(token: string) {
    const subscriber = await this.prisma.newsletter_Subscriber.findUnique({ where: { unsubscribeToken: token } });
    if (!subscriber) throw new NotFoundException('El enlace no es válido');
    if (subscriber.isActive) {
      await this.prisma.newsletter_Subscriber.update({
        where: { id: subscriber.id },
        data: { isActive: false, unsubscribedAt: new Date() },
      });
    }
    return { ok: true };
  }
}