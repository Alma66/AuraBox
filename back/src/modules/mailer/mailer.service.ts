import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor() {
    this.from = process.env.MAIL_FROM || 'AuraBox <no-reply@aurabox.com>';
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendVerificationCode(to: string, code: string, expiresAt: Date) {
    const minutes = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / 60000));
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Código de verificación - AuraBox',
        html: `<p>Tu código de verificación es <strong>${code}</strong>.</p><p>Vence en ${minutes} minutos. No lo compartas si no lo solicitaste vos.</p>`,
      });
    } catch (err) {
      this.logger.error(`No se pudo enviar el email de verificación a ${to}`, err as Error);
      throw new Error('No se pudo enviar el código por email');
    }
  }

  async sendRaw(to: string, subject: string, html: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      return true;
    } catch (err) {
      this.logger.error(`No se pudo enviar el email a ${to}`, err as Error);
      return false;
    }
  }
}