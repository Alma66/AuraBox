import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

interface Sender {
  name: string;
  email: string;
}

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly from: string;
  private readonly brevoKey: string | undefined;

  constructor() {
    this.from = process.env.MAIL_FROM || 'AuraBox <no-reply@aurabox.com>';
    this.brevoKey = process.env.BREVO_API_KEY || undefined;
    if (this.brevoKey) {
      this.transporter = null;
      this.logger.log('Envío de emails por API HTTPS (Brevo)');
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT) || 587,
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
      this.logger.log('Envío de emails por SMTP');
    }
  }

  private parseSender(): Sender {
    const match = this.from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
    if (match) {
      return { name: match[1].trim() || 'AuraBox', email: match[2].trim() };
    }
    return { name: 'AuraBox', email: this.from.trim() };
  }

  private async deliver(to: string, subject: string, html: string): Promise<void> {
    if (this.brevoKey) {
      await axios.post(
        BREVO_URL,
        {
          sender: this.parseSender(),
          to: [{ email: to }],
          subject,
          htmlContent: html,
        },
        {
          headers: {
            'api-key': this.brevoKey,
            'content-type': 'application/json',
            accept: 'application/json',
          },
          timeout: 15000,
        },
      );
      return;
    }
    await this.transporter!.sendMail({ from: this.from, to, subject, html });
  }

  private describeError(err: unknown): string {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { message?: string } | undefined;
      return `${err.response?.status ?? 'sin respuesta'} ${data?.message ?? err.message}`;
    }
    return err instanceof Error ? err.message : String(err);
  }

  async sendVerificationCode(to: string, code: string, expiresAt: Date) {
    const minutes = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / 60000));
    try {
      await this.deliver(
        to,
        'Código de verificación - AuraBox',
        `<p>Tu código de verificación es <strong>${code}</strong>.</p><p>Vence en ${minutes} minutos. No lo compartas si no lo solicitaste vos.</p>`,
      );
    } catch (err) {
      this.logger.error(`No se pudo enviar el email de verificación a ${to}: ${this.describeError(err)}`);
      throw new Error('No se pudo enviar el código por email');
    }
  }

  async sendRaw(to: string, subject: string, html: string): Promise<boolean> {
    try {
      await this.deliver(to, subject, html);
      return true;
    } catch (err) {
      this.logger.error(`No se pudo enviar el email a ${to}: ${this.describeError(err)}`);
      return false;
    }
  }
}