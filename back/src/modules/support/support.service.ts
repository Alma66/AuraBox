import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAutoReplyDto } from './dto/create-auto-reply.dto';
import { UpdateAutoReplyDto } from './dto/update-auto-reply.dto';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';

type RequestUser = { id: number; role: string };

function sanitize(item: any) {
  if (!item) return item;
  for (const k of ['createdAt', 'closedAt', 'lastMessageAt', 'expiresAt', 'viewedAt']) {
    if (item[k] instanceof Date) item[k] = item[k].toISOString();
  }
  return item;
}

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertClubAccess(idClub: number, user: RequestUser) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  private async assertConversationAccess(conversation: { idClub: number; idUser: number }, user: RequestUser) {
    if (user.role === 'admin') return;
    if (user.role === 'customer') {
      if (conversation.idUser !== user.id) throw new ForbiddenException('No tenés acceso a esta conversación');
      return;
    }
    if (user.role === 'entrepreneur') {
      await this.assertClubAccess(conversation.idClub, user);
      return;
    }
    throw new ForbiddenException('No tenés acceso a esta conversación');
  }

  async createConversation(dto: CreateConversationDto, idUser: number) {
    const sub = await this.prisma.user_Subscriptions.findFirst({
      where: { idUser, idSubscriptionTypes: dto.idSubscriptionTypes },
    });
    if (!sub) throw new ForbiddenException('Solo podés contactar clubes a los que estás suscripto');

    const subType = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
    if (!subType || subType.idClub !== dto.idClub) {
      throw new BadRequestException('La suscripción no pertenece a este club');
    }

    const conversation = await this.prisma.support_Conversation.create({
      data: {
        idClub: dto.idClub,
        idUser,
        idSubscriptionTypes: dto.idSubscriptionTypes,
        subject: dto.subject.trim(),
        status: 'Abierta',
      },
    });

    await this.prisma.support_Message.create({
      data: { idConversation: conversation.id, senderType: 'User', senderId: idUser, content: dto.content.trim() },
    });

    await this.handleAutoReply(conversation.id, dto.idClub, dto.content, true);

    return sanitize(conversation);
  }

  private async handleAutoReply(idConversation: number, idClub: number, content: string, isFirstMessage: boolean) {
    const rules = await this.prisma.auto_Reply_Rule.findMany({ where: { idClub, active: true } });
    const lower = content.toLowerCase();
    const match = rules.find((r) => {
      if (r.triggerType === 'Primer_Mensaje') return isFirstMessage;
      if (r.triggerType === 'Contiene_Frase' && r.triggerValue) return lower.includes(r.triggerValue.toLowerCase());
      return false;
    });
    if (match) {
      await this.prisma.support_Message.create({
        data: { idConversation, senderType: 'System', senderId: 0, content: match.replyMessage, isAutoReply: true },
      });
      await this.prisma.support_Conversation.update({
        where: { id: idConversation },
        data: { lastMessageAt: new Date(), hasUnreadForUser: true },
      });
    }
  }

  async findByClub(idClub: number, user: RequestUser, status?: 'Abierta' | 'Cerrada') {
    await this.assertClubAccess(idClub, user);
    const conversations = await this.prisma.support_Conversation.findMany({
      where: { idClub, ...(status ? { status } : {}) },
      orderBy: { lastMessageAt: 'desc' },
    });
    return conversations.map(sanitize);
  }

  async findOne(id: number, user: RequestUser) {
    const conversation = await this.prisma.support_Conversation.findUnique({ where: { id } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    await this.assertConversationAccess(conversation, user);
    return sanitize(conversation);
  }

  async getMessages(idConversation: number, user: RequestUser) {
    const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    await this.assertConversationAccess(conversation, user);

    const messages = await this.prisma.support_Message.findMany({
      where: { idConversation },
      orderBy: { createdAt: 'asc' },
    });
    const attachments = await this.prisma.support_Message_Attachment.findMany({
      where: { idMessage: { in: messages.map((m) => m.id) } },
    });
    return messages.map((m) => ({
      ...sanitize(m),
      attachments: attachments.filter((a) => a.idMessage === m.id),
    }));
  }

  async sendEntrepreneurMessage(
    dto: CreateMessageDto,
    user: RequestUser,
    attachmentUrls: { url: string; type: 'Imagen' | 'Video'; name?: string }[] = [],
  ) {
    const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: dto.idConversation } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    await this.assertClubAccess(conversation.idClub, user);
    if (conversation.status === 'Cerrada') throw new BadRequestException('La conversación está cerrada');

    const content = dto.content?.trim() || null;
    if (!content && attachmentUrls.length === 0) {
      throw new BadRequestException('El mensaje debe tener contenido o un archivo adjunto');
    }

    const message = await this.prisma.support_Message.create({
      data: { idConversation: dto.idConversation, senderType: 'Entrepreneur', senderId: user.id, content },
    });

    for (const att of attachmentUrls) {
      await this.prisma.support_Message_Attachment.create({
        data: { idMessage: message.id, fileUrl: att.url, fileType: att.type, fileName: att.name ?? null },
      });
    }

    await this.prisma.support_Conversation.update({
      where: { id: dto.idConversation },
      data: { lastMessageAt: new Date(), hasUnreadForUser: true, hasUnreadForEntrepreneur: false },
    });

    return sanitize(message);
  }

  async sendUserMessage(
    dto: CreateMessageDto,
    user: RequestUser,
    attachmentUrls: { url: string; type: 'Imagen' | 'Video'; name?: string }[] = [],
  ) {
    const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: dto.idConversation } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    await this.assertConversationAccess(conversation, user);
    if (conversation.status === 'Cerrada') throw new BadRequestException('La conversación está cerrada');

    const content = dto.content?.trim() || null;
    if (!content && attachmentUrls.length === 0) {
      throw new BadRequestException('El mensaje debe tener contenido o un archivo adjunto');
    }

    const message = await this.prisma.support_Message.create({
      data: { idConversation: dto.idConversation, senderType: 'User', senderId: conversation.idUser, content },
    });

    for (const att of attachmentUrls) {
      await this.prisma.support_Message_Attachment.create({
        data: { idMessage: message.id, fileUrl: att.url, fileType: att.type, fileName: att.name ?? null },
      });
    }

    await this.prisma.support_Conversation.update({
      where: { id: dto.idConversation },
      data: { lastMessageAt: new Date(), hasUnreadForEntrepreneur: true },
    });

    await this.handleAutoReply(dto.idConversation, conversation.idClub, content ?? '', false);

    return sanitize(message);
  }

  async markRead(idConversation: number, user: RequestUser) {
    const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    await this.assertConversationAccess(conversation, user);

    const data = user.role === 'customer' ? { hasUnreadForUser: false } : { hasUnreadForEntrepreneur: false };
    return sanitize(await this.prisma.support_Conversation.update({ where: { id: idConversation }, data }));
  }

  async closeConversation(idConversation: number, user: RequestUser) {
    const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    await this.assertClubAccess(conversation.idClub, user);

    return sanitize(
      await this.prisma.support_Conversation.update({
        where: { id: idConversation },
        data: { status: 'Cerrada', closedAt: new Date() },
      }),
    );
  }

  async reopenConversation(idConversation: number, user: RequestUser) {
    const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    await this.assertClubAccess(conversation.idClub, user);

    return sanitize(
      await this.prisma.support_Conversation.update({
        where: { id: idConversation },
        data: { status: 'Abierta', closedAt: null },
      }),
    );
  }

  async getBasicCustomerInfo(idConversation: number, user: RequestUser) {
    const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    await this.assertClubAccess(conversation.idClub, user);

    const subTypes = await this.prisma.subscription_Types.findMany({ where: { idClub: conversation.idClub } });
    const subTypeIds = subTypes.map((s) => s.id);

    const subscriptions = await this.prisma.user_Subscriptions.findMany({
      where: { idUser: conversation.idUser, idSubscriptionTypes: { in: subTypeIds } },
    });

    const enriched = await Promise.all(
      subscriptions.map(async (sub) => {
        const subType = subTypes.find((s) => s.id === sub.idSubscriptionTypes);
        const shipment = await this.prisma.shipments.findFirst({
          where: { idUserSubscriptions: sub.id },
          orderBy: { id: 'desc' },
        });
        let courierName: string | null = null;
        let riderName: string | null = null;
        if (shipment?.idCourier) {
          const courier = await this.prisma.courier.findUnique({ where: { id: shipment.idCourier } });
          courierName = courier?.name ?? null;
        }
        if (shipment?.idAssignedRider) {
          const rider = await this.prisma.entrepreneurs.findUnique({ where: { id: shipment.idAssignedRider } });
          riderName = rider ? `${rider.firstName} ${rider.lastName}` : null;
        }
        return {
          subscriptionName: subType?.name ?? 'Desconocida',
          startDate: sub.startDate.toISOString(),
          paymentMethodType: sub.idPaymentMethods ? 'Registrado' : 'No especificado',
          shipmentStatus: shipment?.shipmentStatus ?? 'Sin envíos registrados',
          courier: courierName,
          rider: riderName,
          province: shipment?.province ?? null,
          locality: shipment?.locality ?? null,
        };
      }),
    );

    return enriched;
  }

  async requestVerification(dto: RequestVerificationDto, user: RequestUser) {
    const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: dto.idConversation } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    await this.assertClubAccess(conversation.idClub, user);

    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.sensitive_Data_Verification.create({
      data: { idConversation: dto.idConversation, code, channel: dto.channel, expiresAt, createdBy: user.id },
    });

    return { channel: dto.channel, expiresAt: expiresAt.toISOString() };
  }

  async confirmVerification(dto: ConfirmVerificationDto, user: RequestUser) {
    const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: dto.idConversation } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    await this.assertClubAccess(conversation.idClub, user);

    const customer = await this.prisma.user.findUnique({ where: { id: conversation.idUser } });
    if (!customer) throw new NotFoundException('Usuario no encontrado');

    const normalizedDni = dto.dni.replace(/\D/g, '');
    if (String(customer.documentNumber) !== normalizedDni) {
      throw new BadRequestException('El DNI no coincide');
    }

    const verification = await this.prisma.sensitive_Data_Verification.findFirst({
      where: { idConversation: dto.idConversation, code: dto.code, used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!verification) throw new BadRequestException('Código inválido');
    if (verification.expiresAt < new Date()) throw new BadRequestException('El código expiró');

    await this.prisma.sensitive_Data_Verification.update({ where: { id: verification.id }, data: { used: true } });

    const subTypes = await this.prisma.subscription_Types.findMany({ where: { idClub: conversation.idClub } });
    const subTypeIds = subTypes.map((s) => s.id);
    const subscriptions = await this.prisma.user_Subscriptions.findMany({
      where: { idUser: conversation.idUser, idSubscriptionTypes: { in: subTypeIds } },
    });

    const lastShipments = await Promise.all(
      subscriptions.map((sub) =>
        this.prisma.shipments.findFirst({ where: { idUserSubscriptions: sub.id }, orderBy: { id: 'desc' } }),
      ),
    );

    const sensitiveData = {
      dni: customer.documentNumber,
      phoneNumber: customer.phoneNumber,
      streetAddress: customer.streetAddress,
      addressNumber: customer.addressNumber,
      floorNumber: customer.floorNumber,
      addressDetails: customer.addressDetails,
      postalCode: customer.postalCode,
      city: customer.city,
      lastCardDigits: lastShipments.map((s) => s?.trackingNumber ?? null),
    };

    await this.prisma.sensitive_Data_Access_Log.create({
      data: {
        idConversation: dto.idConversation,
        idEntrepreneur: user.id,
        fieldsViewed: Object.keys(sensitiveData).join(','),
      },
    });

    return sensitiveData;
  }

  async getAccessLogs(idConversation: number, user: RequestUser) {
    const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    await this.assertClubAccess(conversation.idClub, user);

    const logs = await this.prisma.sensitive_Data_Access_Log.findMany({
      where: { idConversation },
      orderBy: { viewedAt: 'desc' },
    });
    return logs.map(sanitize);
  }

  async createAutoReply(dto: CreateAutoReplyDto, user: RequestUser) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    await this.assertClubAccess(dto.idClub, user);

    return this.prisma.auto_Reply_Rule.create({
      data: {
        idClub: dto.idClub,
        name: dto.name.trim(),
        triggerType: dto.triggerType,
        triggerValue: dto.triggerValue?.trim() ?? null,
        replyMessage: dto.replyMessage.trim(),
        active: dto.active ?? true,
      },
    });
  }

  async findAutoRepliesByClub(idClub: number, user: RequestUser) {
    await this.assertClubAccess(idClub, user);
    return this.prisma.auto_Reply_Rule.findMany({ where: { idClub }, orderBy: { createdAt: 'desc' } });
  }

  async updateAutoReply(id: number, dto: UpdateAutoReplyDto, user: RequestUser) {
    const rule = await this.prisma.auto_Reply_Rule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Regla no encontrada');
    await this.assertClubAccess(rule.idClub, user);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.triggerType !== undefined) data.triggerType = dto.triggerType;
    if (dto.triggerValue !== undefined) data.triggerValue = dto.triggerValue?.trim() ?? null;
    if (dto.replyMessage !== undefined) data.replyMessage = dto.replyMessage.trim();
    if (dto.active !== undefined) data.active = dto.active;

    return this.prisma.auto_Reply_Rule.update({ where: { id }, data });
  }

  async removeAutoReply(id: number, user: RequestUser) {
    const rule = await this.prisma.auto_Reply_Rule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Regla no encontrada');
    await this.assertClubAccess(rule.idClub, user);

    await this.prisma.auto_Reply_Rule.delete({ where: { id } });
    return { message: 'Regla eliminada correctamente' };
  }
}