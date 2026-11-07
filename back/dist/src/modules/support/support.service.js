"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const mailer_service_1 = require("../mailer/mailer.service");
const CODE_COOLDOWN_MS = 60 * 1000;
const CODE_LIFETIME_MS = 10 * 60 * 1000;
function sanitize(item) {
    if (!item)
        return item;
    for (const k of ['createdAt', 'closedAt', 'lastMessageAt', 'expiresAt', 'viewedAt']) {
        if (item[k] instanceof Date)
            item[k] = item[k].toISOString();
    }
    return item;
}
let SupportService = class SupportService {
    prisma;
    mailer;
    constructor(prisma, mailer) {
        this.prisma = prisma;
        this.mailer = mailer;
    }
    async assertClubAccess(idClub, user) {
        if (user.role === 'admin')
            return;
        const assoc = await this.prisma.entrepreneur_Club.findFirst({
            where: { idClub, idEntrepreneurs: user.id },
        });
        if (!assoc)
            throw new common_1.ForbiddenException('No tenés acceso a este club');
    }
    async assertConversationAccess(conversation, user) {
        if (user.role === 'admin')
            return;
        if (user.role === 'customer') {
            if (conversation.idUser !== user.id)
                throw new common_1.ForbiddenException('No tenés acceso a esta conversación');
            return;
        }
        if (user.role === 'entrepreneur') {
            await this.assertClubAccess(conversation.idClub, user);
            return;
        }
        throw new common_1.ForbiddenException('No tenés acceso a esta conversación');
    }
    assertEntrepreneur(user) {
        if (user.role !== 'entrepreneur') {
            throw new common_1.ForbiddenException('Solo el emprendedor del club puede realizar esta acción');
        }
    }
    async assertCanPost(idConversation, user) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        await this.assertConversationAccess(conversation, user);
        if (conversation.status === 'Cerrada')
            throw new common_1.BadRequestException('La conversación está cerrada');
        return conversation;
    }
    async createConversation(dto, idUser) {
        const sub = await this.prisma.user_Subscriptions.findFirst({
            where: { idUser, idSubscriptionTypes: dto.idSubscriptionTypes },
        });
        if (!sub)
            throw new common_1.ForbiddenException('Solo podés contactar clubes a los que estás suscripto');
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
        if (!subType || subType.idClub !== dto.idClub) {
            throw new common_1.BadRequestException('La suscripción no pertenece a este club');
        }
        const conversation = await this.prisma.$transaction(async (tx) => {
            const created = await tx.support_Conversation.create({
                data: {
                    idClub: dto.idClub,
                    idUser,
                    idSubscriptionTypes: dto.idSubscriptionTypes,
                    subject: dto.subject.trim(),
                    status: 'Abierta',
                },
            });
            await tx.support_Message.create({
                data: { idConversation: created.id, senderType: 'User', senderId: idUser, content: dto.content.trim() },
            });
            return created;
        });
        await this.handleAutoReply(conversation.id, dto.idClub, dto.content, true);
        return sanitize(conversation);
    }
    async handleAutoReply(idConversation, idClub, content, isFirstMessage) {
        const rules = await this.prisma.auto_Reply_Rule.findMany({ where: { idClub, active: true } });
        const lower = content.toLowerCase();
        const match = rules.find((r) => {
            if (r.triggerType === 'Primer_Mensaje')
                return isFirstMessage;
            if (r.triggerType === 'Contiene_Frase' && r.triggerValue)
                return lower.includes(r.triggerValue.toLowerCase());
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
    async findByClub(idClub, user, status) {
        await this.assertClubAccess(idClub, user);
        const conversations = await this.prisma.support_Conversation.findMany({
            where: { idClub, ...(status ? { status } : {}) },
            orderBy: { lastMessageAt: 'desc' },
        });
        const userIds = Array.from(new Set(conversations.map((c) => c.idUser)));
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, firstName: true, lastName: true },
        });
        return conversations.map((c) => {
            const customer = users.find((u) => u.id === c.idUser);
            return {
                ...sanitize(c),
                customerFirstName: customer?.firstName ?? null,
                customerLastName: customer?.lastName ?? null,
            };
        });
    }
    async findOne(id, user) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        await this.assertConversationAccess(conversation, user);
        return sanitize(conversation);
    }
    async getMessages(idConversation, user) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
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
    async sendEntrepreneurMessage(dto, user, attachmentUrls = []) {
        this.assertEntrepreneur(user);
        await this.assertCanPost(dto.idConversation, user);
        const content = dto.content?.trim() || null;
        if (!content && attachmentUrls.length === 0) {
            throw new common_1.BadRequestException('El mensaje debe tener contenido o un archivo adjunto');
        }
        const message = await this.prisma.$transaction(async (tx) => {
            const created = await tx.support_Message.create({
                data: { idConversation: dto.idConversation, senderType: 'Entrepreneur', senderId: user.id, content },
            });
            if (attachmentUrls.length > 0) {
                await tx.support_Message_Attachment.createMany({
                    data: attachmentUrls.map((att) => ({
                        idMessage: created.id,
                        fileUrl: att.url,
                        fileType: att.type,
                        fileName: att.name ?? null,
                    })),
                });
            }
            await tx.support_Conversation.update({
                where: { id: dto.idConversation },
                data: { lastMessageAt: new Date(), hasUnreadForUser: true, hasUnreadForEntrepreneur: false },
            });
            return created;
        });
        return sanitize(message);
    }
    async sendUserMessage(dto, user, attachmentUrls = []) {
        if (user.role !== 'customer')
            throw new common_1.ForbiddenException('Solo el cliente puede enviar este mensaje');
        const conversation = await this.assertCanPost(dto.idConversation, user);
        const content = dto.content?.trim() || null;
        if (!content && attachmentUrls.length === 0) {
            throw new common_1.BadRequestException('El mensaje debe tener contenido o un archivo adjunto');
        }
        const message = await this.prisma.$transaction(async (tx) => {
            const created = await tx.support_Message.create({
                data: { idConversation: dto.idConversation, senderType: 'User', senderId: conversation.idUser, content },
            });
            if (attachmentUrls.length > 0) {
                await tx.support_Message_Attachment.createMany({
                    data: attachmentUrls.map((att) => ({
                        idMessage: created.id,
                        fileUrl: att.url,
                        fileType: att.type,
                        fileName: att.name ?? null,
                    })),
                });
            }
            await tx.support_Conversation.update({
                where: { id: dto.idConversation },
                data: { lastMessageAt: new Date(), hasUnreadForEntrepreneur: true },
            });
            return created;
        });
        await this.handleAutoReply(dto.idConversation, conversation.idClub, content ?? '', false);
        return sanitize(message);
    }
    async markRead(idConversation, user) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        await this.assertConversationAccess(conversation, user);
        if (user.role === 'admin')
            return sanitize(conversation);
        const data = user.role === 'customer' ? { hasUnreadForUser: false } : { hasUnreadForEntrepreneur: false };
        return sanitize(await this.prisma.support_Conversation.update({ where: { id: idConversation }, data }));
    }
    async closeConversation(idConversation, user) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        await this.assertClubAccess(conversation.idClub, user);
        return sanitize(await this.prisma.support_Conversation.update({
            where: { id: idConversation },
            data: { status: 'Cerrada', closedAt: new Date() },
        }));
    }
    async reopenConversation(idConversation, user) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        await this.assertClubAccess(conversation.idClub, user);
        return sanitize(await this.prisma.support_Conversation.update({
            where: { id: idConversation },
            data: { status: 'Abierta', closedAt: null },
        }));
    }
    async getBasicCustomerInfo(idConversation, user) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        await this.assertClubAccess(conversation.idClub, user);
        const subTypes = await this.prisma.subscription_Types.findMany({ where: { idClub: conversation.idClub } });
        const subTypeIds = subTypes.map((s) => s.id);
        const subscriptions = await this.prisma.user_Subscriptions.findMany({
            where: { idUser: conversation.idUser, idSubscriptionTypes: { in: subTypeIds } },
        });
        const enriched = await Promise.all(subscriptions.map(async (sub) => {
            const subType = subTypes.find((s) => s.id === sub.idSubscriptionTypes);
            const shipment = await this.prisma.shipments.findFirst({
                where: { idUserSubscriptions: sub.id },
                orderBy: { id: 'desc' },
            });
            let courierName = null;
            let riderName = null;
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
        }));
        return enriched;
    }
    async requestVerification(dto, user) {
        this.assertEntrepreneur(user);
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: dto.idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        await this.assertClubAccess(conversation.idClub, user);
        if (dto.channel !== 'Email') {
            throw new common_1.BadRequestException('Por ahora la verificación solo está disponible por email');
        }
        const customer = await this.prisma.user.findUnique({ where: { id: conversation.idUser } });
        if (!customer)
            throw new common_1.NotFoundException('Usuario no encontrado');
        if (!customer.email)
            throw new common_1.BadRequestException('El cliente no tiene un email registrado');
        const last = await this.prisma.sensitive_Data_Verification.findFirst({
            where: { idConversation: dto.idConversation },
            orderBy: { createdAt: 'desc' },
        });
        if (last && Date.now() - last.createdAt.getTime() < CODE_COOLDOWN_MS) {
            throw new common_1.BadRequestException('Esperá un minuto antes de pedir otro código');
        }
        const code = (0, crypto_1.randomInt)(100000, 1000000).toString();
        const expiresAt = new Date(Date.now() + CODE_LIFETIME_MS);
        const [, verification] = await this.prisma.$transaction([
            this.prisma.sensitive_Data_Verification.updateMany({
                where: { idConversation: dto.idConversation, used: false },
                data: { used: true },
            }),
            this.prisma.sensitive_Data_Verification.create({
                data: { idConversation: dto.idConversation, code, channel: dto.channel, expiresAt, createdBy: user.id },
            }),
        ]);
        try {
            await this.mailer.sendVerificationCode(customer.email, code, expiresAt);
        }
        catch {
            await this.prisma.sensitive_Data_Verification.update({ where: { id: verification.id }, data: { used: true } });
            throw new common_1.BadRequestException('No se pudo enviar el código al email del cliente');
        }
        return { channel: dto.channel, expiresAt: expiresAt.toISOString(), sent: true };
    }
    async confirmVerification(dto, user) {
        this.assertEntrepreneur(user);
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: dto.idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        await this.assertClubAccess(conversation.idClub, user);
        const customer = await this.prisma.user.findUnique({ where: { id: conversation.idUser } });
        if (!customer)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const verification = await this.prisma.sensitive_Data_Verification.findFirst({
            where: { idConversation: dto.idConversation, used: false, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });
        const normalizedDni = String(dto.dni ?? '').replace(/\D/g, '');
        const valid = !!verification &&
            verification.code === String(dto.code) &&
            String(customer.documentNumber) === normalizedDni;
        if (!valid || !verification) {
            throw new common_1.BadRequestException('Los datos de verificación no son válidos o el código expiró');
        }
        await this.prisma.sensitive_Data_Verification.update({ where: { id: verification.id }, data: { used: true } });
        const subTypes = await this.prisma.subscription_Types.findMany({ where: { idClub: conversation.idClub } });
        const subTypeIds = subTypes.map((s) => s.id);
        const subscriptions = await this.prisma.user_Subscriptions.findMany({
            where: { idUser: conversation.idUser, idSubscriptionTypes: { in: subTypeIds } },
        });
        const lastShipments = await Promise.all(subscriptions.map((sub) => this.prisma.shipments.findFirst({ where: { idUserSubscriptions: sub.id }, orderBy: { id: 'desc' } })));
        const sensitiveData = {
            dni: customer.documentNumber,
            phoneNumber: customer.phoneNumber,
            streetAddress: customer.streetAddress,
            addressNumber: customer.addressNumber,
            floorNumber: customer.floorNumber,
            addressDetails: customer.addressDetails,
            postalCode: customer.postalCode,
            city: customer.city,
            trackingNumbers: lastShipments.map((s) => s?.trackingNumber ?? null),
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
    async getAccessLogs(idConversation, user) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        await this.assertClubAccess(conversation.idClub, user);
        const logs = await this.prisma.sensitive_Data_Access_Log.findMany({
            where: { idConversation },
            orderBy: { viewedAt: 'desc' },
        });
        return logs.map(sanitize);
    }
    async createAutoReply(dto, user) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
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
    async findAutoRepliesByClub(idClub, user) {
        await this.assertClubAccess(idClub, user);
        return this.prisma.auto_Reply_Rule.findMany({ where: { idClub }, orderBy: { createdAt: 'desc' } });
    }
    async updateAutoReply(id, dto, user) {
        const rule = await this.prisma.auto_Reply_Rule.findUnique({ where: { id } });
        if (!rule)
            throw new common_1.NotFoundException('Regla no encontrada');
        await this.assertClubAccess(rule.idClub, user);
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name.trim();
        if (dto.triggerType !== undefined)
            data.triggerType = dto.triggerType;
        if (dto.triggerValue !== undefined)
            data.triggerValue = dto.triggerValue?.trim() ?? null;
        if (dto.replyMessage !== undefined)
            data.replyMessage = dto.replyMessage.trim();
        if (dto.active !== undefined)
            data.active = dto.active;
        return this.prisma.auto_Reply_Rule.update({ where: { id }, data });
    }
    async removeAutoReply(id, user) {
        const rule = await this.prisma.auto_Reply_Rule.findUnique({ where: { id } });
        if (!rule)
            throw new common_1.NotFoundException('Regla no encontrada');
        await this.assertClubAccess(rule.idClub, user);
        await this.prisma.auto_Reply_Rule.delete({ where: { id } });
        return { message: 'Regla eliminada correctamente' };
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mailer_service_1.MailerService])
], SupportService);
//# sourceMappingURL=support.service.js.map