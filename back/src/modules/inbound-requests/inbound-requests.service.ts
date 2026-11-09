import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InboundRequestStatus, InboundRequestType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { ContactRequestDto, JobApplicationDto } from './dto/inbound-request.dto';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const DAILY_LIMIT_PER_EMAIL = 5;

@Injectable()
export class InboundRequestsService {
  private readonly logger = new Logger(InboundRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  private async enforceDailyLimit(email: string, type: InboundRequestType) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const total = await this.prisma.inbound_Request.count({
      where: { email, type, createdAt: { gte: since } },
    });
    if (total >= DAILY_LIMIT_PER_EMAIL) {
      throw new HttpException(
        'Recibimos varios mensajes tuyos hoy. Probá de nuevo mañana.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async notify(subject: string, rows: Array<[string, string | undefined]>, replyTo: string) {
    const inbox = process.env.CONTACT_INBOX_EMAIL || process.env.MAIL_USER;
    if (!inbox) return;
    const body = rows
      .filter(([, value]) => !!value)
      .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value as string).replace(/\n/g, '<br>')}</p>`)
      .join('');
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;color:#1f2a44"><h3>${escapeHtml(subject)}</h3>${body}<p style="font-size:12px;color:#6b7280">Respondé a ${escapeHtml(replyTo)}. También lo ves en el panel de administración.</p></div>`;
    const sent = await this.mailer.sendRaw(inbox, `[AuraBox] ${subject}`, html);
    if (!sent) this.logger.warn('No se pudo avisar por email de una solicitud entrante');
  }

  private async confirm(to: string, name: string, kind: 'consulta' | 'postulación') {
    const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#1f2a44"><h2>Recibimos tu ${kind}</h2><p>Hola ${escapeHtml(name)}, gracias por escribirnos. El equipo de AuraBox la va a revisar y te responde a este mismo correo.</p></div>`;
    await this.mailer.sendRaw(to, `Recibimos tu ${kind} - AuraBox`, html);
  }

  async createContact(dto: ContactRequestDto) {
    if (dto.website) return { received: true };
    await this.enforceDailyLimit(dto.email, InboundRequestType.Consulta);

    await this.prisma.inbound_Request.create({
      data: {
        type: InboundRequestType.Consulta,
        fullName: dto.fullName,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
      },
    });

    void this.notify(
      `Nueva consulta: ${dto.subject}`,
      [['Nombre', dto.fullName], ['Email', dto.email], ['Mensaje', dto.message]],
      dto.email,
    );
    void this.confirm(dto.email, dto.fullName, 'consulta');
    return { received: true };
  }

  async createJobApplication(dto: JobApplicationDto) {
    if (dto.website) return { received: true };
    await this.enforceDailyLimit(dto.email, InboundRequestType.Trabajo);

    await this.prisma.inbound_Request.create({
      data: {
        type: InboundRequestType.Trabajo,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone ?? null,
        area: dto.area,
        profileUrl: dto.profileUrl ?? null,
        message: dto.message,
      },
    });

    void this.notify(
      `Nueva postulación: ${dto.area}`,
      [
        ['Nombre', dto.fullName],
        ['Email', dto.email],
        ['Teléfono', dto.phone],
        ['Área', dto.area],
        ['Perfil', dto.profileUrl],
        ['Mensaje', dto.message],
      ],
      dto.email,
    );
    void this.confirm(dto.email, dto.fullName, 'postulación');
    return { received: true };
  }

  async findAll(type?: string, status?: string) {
    return this.prisma.inbound_Request.findMany({
      where: {
        ...(type ? { type: type as InboundRequestType } : {}),
        ...(status ? { status: status as InboundRequestStatus } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
  }

  async updateStatus(id: number, status: string) {
    const existing = await this.prisma.inbound_Request.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Solicitud no encontrada');
    return this.prisma.inbound_Request.update({
      where: { id },
      data: {
        status: status as InboundRequestStatus,
        handledAt: status === 'Nuevo' ? null : new Date(),
      },
    });
  }
}