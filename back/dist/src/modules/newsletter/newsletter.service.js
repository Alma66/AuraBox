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
exports.NewsletterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const mailer_service_1 = require("../mailer/mailer.service");
const DAILY_EMAIL_LIMIT = Number(process.env.MAIL_DAILY_LIMIT) || 450;
function sanitize(item) {
    if (!item)
        return item;
    for (const k of ['createdAt', 'completedAt']) {
        if (item[k] instanceof Date)
            item[k] = item[k].toISOString();
    }
    return item;
}
let NewsletterService = class NewsletterService {
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
    async getSentTodayCount() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const sends = await this.prisma.newsletter_Send.findMany({
            where: { createdAt: { gte: startOfDay } },
            select: { sentCount: true },
        });
        return sends.reduce((acc, s) => acc + s.sentCount, 0);
    }
    async findSubscriberEmails(idClub) {
        const subTypes = await this.prisma.subscription_Types.findMany({
            where: { idClub },
            select: { id: true },
        });
        const subTypeIds = subTypes.map((s) => s.id);
        if (subTypeIds.length === 0)
            return [];
        const activeSubs = await this.prisma.user_Subscriptions.findMany({
            where: { idSubscriptionTypes: { in: subTypeIds }, subscriptionStatus: 'Activa' },
            select: { idUser: true },
        });
        const userIds = Array.from(new Set(activeSubs.map((s) => s.idUser)));
        if (userIds.length === 0)
            return [];
        return this.prisma.user.findMany({
            where: { id: { in: userIds }, acceptsNewsletter: true },
            select: { email: true },
        });
    }
    async send(dto, user) {
        await this.assertClubAccess(dto.idClub, user);
        const subscribers = await this.findSubscriberEmails(dto.idClub);
        if (subscribers.length === 0) {
            throw new common_1.BadRequestException('Este club no tiene suscriptores activos con newsletter habilitado');
        }
        const alreadySentToday = await this.getSentTodayCount();
        const remainingQuota = DAILY_EMAIL_LIMIT - alreadySentToday;
        if (remainingQuota <= 0) {
            throw new common_1.BadRequestException(`Se alcanzó el límite diario de envíos de email (${DAILY_EMAIL_LIMIT}). Probá de nuevo mañana.`);
        }
        const recipients = subscribers.slice(0, remainingQuota);
        const truncated = subscribers.length > recipients.length;
        const record = await this.prisma.newsletter_Send.create({
            data: {
                idClub: dto.idClub,
                idEntrepreneur: user.id,
                subject: dto.subject.trim(),
                content: dto.content.trim(),
                recipientCount: recipients.length,
                status: 'Enviando',
            },
        });
        let sentCount = 0;
        let failedCount = 0;
        for (const recipient of recipients) {
            const ok = await this.mailer.sendRaw(recipient.email, dto.subject.trim(), dto.content.trim());
            if (ok)
                sentCount += 1;
            else
                failedCount += 1;
        }
        const updated = await this.prisma.newsletter_Send.update({
            where: { id: record.id },
            data: {
                sentCount,
                failedCount,
                status: failedCount === 0 ? 'Completado' : 'Con_Errores',
                completedAt: new Date(),
            },
        });
        return {
            ...sanitize(updated),
            truncatedByDailyLimit: truncated,
            totalEligibleSubscribers: subscribers.length,
        };
    }
    async findHistoryByClub(idClub, user) {
        await this.assertClubAccess(idClub, user);
        const history = await this.prisma.newsletter_Send.findMany({
            where: { idClub },
            orderBy: { createdAt: 'desc' },
        });
        return history.map(sanitize);
    }
};
exports.NewsletterService = NewsletterService;
exports.NewsletterService = NewsletterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mailer_service_1.MailerService])
], NewsletterService);
//# sourceMappingURL=newsletter.service.js.map