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
const prisma_service_1 = require("../../prisma/prisma.service");
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
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createConversation(dto) {
        const sub = await this.prisma.user_Subscriptions.findFirst({
            where: { idUser: dto.idUser, idSubscriptionTypes: dto.idSubscriptionTypes },
        });
        if (!sub)
            throw new common_1.ForbiddenException('Solo podés contactar clubes a los que estás suscripto');
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
        if (!subType || subType.idClub !== dto.idClub) {
            throw new common_1.BadRequestException('La suscripción no pertenece a este club');
        }
        const conversation = await this.prisma.support_Conversation.create({
            data: {
                idClub: dto.idClub,
                idUser: dto.idUser,
                idSubscriptionTypes: dto.idSubscriptionTypes,
                subject: dto.subject,
                status: 'Abierta',
            },
        });
        await this.prisma.support_Message.create({
            data: { idConversation: conversation.id, senderType: 'User', senderId: dto.idUser, content: dto.content },
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
    async findByClub(idClub, status) {
        const conversations = await this.prisma.support_Conversation.findMany({
            where: { idClub, ...(status ? { status } : {}) },
            orderBy: { lastMessageAt: 'desc' },
        });
        return conversations.map(sanitize);
    }
    async findOne(id) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        return sanitize(conversation);
    }
    async getMessages(idConversation) {
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
    async sendEntrepreneurMessage(dto, attachmentUrls = []) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: dto.idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        const message = await this.prisma.support_Message.create({
            data: { idConversation: dto.idConversation, senderType: 'Entrepreneur', senderId: 0, content: dto.content ?? null },
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
    async sendUserMessage(dto, attachmentUrls = []) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: dto.idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        if (conversation.status === 'Cerrada')
            throw new common_1.BadRequestException('La conversación está cerrada');
        const message = await this.prisma.support_Message.create({
            data: { idConversation: dto.idConversation, senderType: 'User', senderId: conversation.idUser, content: dto.content ?? null },
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
        await this.handleAutoReply(dto.idConversation, conversation.idClub, dto.content ?? '', false);
        return sanitize(message);
    }
    async markRead(idConversation, by) {
        const data = by === 'entrepreneur' ? { hasUnreadForEntrepreneur: false } : { hasUnreadForUser: false };
        return this.prisma.support_Conversation.update({ where: { id: idConversation }, data });
    }
    async closeConversation(idConversation) {
        return this.prisma.support_Conversation.update({
            where: { id: idConversation },
            data: { status: 'Cerrada', closedAt: new Date() },
        });
    }
    async reopenConversation(idConversation) {
        return this.prisma.support_Conversation.update({
            where: { id: idConversation },
            data: { status: 'Abierta', closedAt: null },
        });
    }
    async getBasicCustomerInfo(idConversation) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
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
    async requestVerification(dto, createdBy) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: dto.idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.sensitive_Data_Verification.create({
            data: { idConversation: dto.idConversation, code, channel: dto.channel, expiresAt, createdBy: createdBy ?? null },
        });
        return { code, channel: dto.channel, expiresAt: expiresAt.toISOString() };
    }
    async confirmVerification(dto, entrepreneurId) {
        const conversation = await this.prisma.support_Conversation.findUnique({ where: { id: dto.idConversation } });
        if (!conversation)
            throw new common_1.NotFoundException('Conversación no encontrada');
        const user = await this.prisma.user.findUnique({ where: { id: conversation.idUser } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        if (String(user.documentNumber) !== dto.dni.trim()) {
            throw new common_1.BadRequestException('El DNI no coincide');
        }
        const verification = await this.prisma.sensitive_Data_Verification.findFirst({
            where: { idConversation: dto.idConversation, code: dto.code, used: false },
            orderBy: { createdAt: 'desc' },
        });
        if (!verification)
            throw new common_1.BadRequestException('Código inválido');
        if (verification.expiresAt < new Date())
            throw new common_1.BadRequestException('El código expiró');
        await this.prisma.sensitive_Data_Verification.update({ where: { id: verification.id }, data: { used: true } });
        const subTypes = await this.prisma.subscription_Types.findMany({ where: { idClub: conversation.idClub } });
        const subTypeIds = subTypes.map((s) => s.id);
        const subscriptions = await this.prisma.user_Subscriptions.findMany({
            where: { idUser: conversation.idUser, idSubscriptionTypes: { in: subTypeIds } },
        });
        const lastShipments = await Promise.all(subscriptions.map((sub) => this.prisma.shipments.findFirst({ where: { idUserSubscriptions: sub.id }, orderBy: { id: 'desc' } })));
        const sensitiveData = {
            dni: user.documentNumber,
            phoneNumber: user.phoneNumber,
            streetAddress: user.streetAddress,
            addressNumber: user.addressNumber,
            floorNumber: user.floorNumber,
            addressDetails: user.addressDetails,
            postalCode: user.postalCode,
            city: user.city,
            lastCardDigits: lastShipments.map((s) => s?.trackingNumber ?? null),
        };
        if (entrepreneurId) {
            await this.prisma.sensitive_Data_Access_Log.create({
                data: {
                    idConversation: dto.idConversation,
                    idEntrepreneur: entrepreneurId,
                    fieldsViewed: Object.keys(sensitiveData).join(','),
                },
            });
        }
        return sensitiveData;
    }
    async getAccessLogs(idConversation) {
        const logs = await this.prisma.sensitive_Data_Access_Log.findMany({
            where: { idConversation },
            orderBy: { viewedAt: 'desc' },
        });
        return logs.map(sanitize);
    }
    async createAutoReply(dto) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        return this.prisma.auto_Reply_Rule.create({
            data: {
                idClub: dto.idClub,
                name: dto.name,
                triggerType: dto.triggerType,
                triggerValue: dto.triggerValue ?? null,
                replyMessage: dto.replyMessage,
                active: dto.active ?? true,
            },
        });
    }
    async findAutoRepliesByClub(idClub) {
        return this.prisma.auto_Reply_Rule.findMany({ where: { idClub }, orderBy: { createdAt: 'desc' } });
    }
    async updateAutoReply(id, dto) {
        const rule = await this.prisma.auto_Reply_Rule.findUnique({ where: { id } });
        if (!rule)
            throw new common_1.NotFoundException('Regla no encontrada');
        return this.prisma.auto_Reply_Rule.update({ where: { id }, data: dto });
    }
    async removeAutoReply(id) {
        const rule = await this.prisma.auto_Reply_Rule.findUnique({ where: { id } });
        if (!rule)
            throw new common_1.NotFoundException('Regla no encontrada');
        await this.prisma.auto_Reply_Rule.delete({ where: { id } });
        return { message: 'Regla eliminada correctamente' };
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportService);
//# sourceMappingURL=support.service.js.map