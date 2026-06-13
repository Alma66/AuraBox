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
exports.UserSubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(sub) {
    if (!sub)
        return sub;
    if (sub.monthlyAmountPaid !== undefined && sub.monthlyAmountPaid !== null) {
        try {
            sub.monthlyAmountPaid = sub.monthlyAmountPaid.toString();
        }
        catch { }
    }
    ['startDate', 'expectedEndDate', 'lastPaymentDate', 'nextPaymentDate', 'cancellationDate'].forEach((k) => {
        if (sub[k] instanceof Date)
            sub[k] = sub[k].toISOString();
    });
    return sub;
}
let UserSubscriptionsService = class UserSubscriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, actingUserId) {
        const userId = dto.idUser ?? actingUserId;
        if (!userId)
            throw new common_1.BadRequestException('idUser no especificado');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const sType = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
        if (!sType)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        if (dto.idPaymentMethods) {
            const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethods } });
            if (!pm)
                throw new common_1.NotFoundException('Método de pago no encontrado');
        }
        const existing = await this.prisma.user_Subscriptions.findFirst({
            where: {
                idUser: userId,
                idSubscriptionTypes: dto.idSubscriptionTypes,
                subscriptionStatus: { not: 'CANCELLED' },
            },
        });
        if (existing)
            throw new common_1.BadRequestException('Ya tienes una suscripción activa a este tipo');
        const data = {
            idUser: userId,
            idPaymentMethods: dto.idPaymentMethods ?? undefined,
            idSubscriptionTypes: dto.idSubscriptionTypes,
            startDate: dto.startDate ?? new Date(),
            expectedEndDate: dto.expectedEndDate ?? undefined,
            subscriptionStatus: 'ACTIVA',
            lastPaymentDate: undefined,
            nextPaymentDate: undefined,
            monthlyAmountPaid: dto.monthlyAmountPaid ?? undefined,
            cancellationReason: dto.cancellationReason ?? undefined,
            cancellationDate: dto.cancellationDate ?? undefined,
        };
        const created = await this.prisma.user_Subscriptions.create({ data });
        return sanitize(created);
    }
    async findAll() {
        const rows = await this.prisma.user_Subscriptions.findMany({
            orderBy: { startDate: 'desc' },
        });
        return rows.map((r) => sanitize(r));
    }
    async findById(id) {
        const row = await this.prisma.user_Subscriptions.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Suscripción no encontrada');
        return sanitize(row);
    }
    async findByUser(userId) {
        const rows = await this.prisma.user_Subscriptions.findMany({
            where: { idUser: userId },
            orderBy: { startDate: 'desc' },
        });
        return rows.map((r) => sanitize(r));
    }
    async update(id, dto, actingUserRole) {
        const existing = await this.prisma.user_Subscriptions.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Suscripción no encontrada');
        const data = {};
        if (dto.subscriptionStatus !== undefined)
            data.subscriptionStatus = dto.subscriptionStatus;
        if (dto.lastPaymentDate !== undefined)
            data.lastPaymentDate = dto.lastPaymentDate;
        if (dto.nextPaymentDate !== undefined)
            data.nextPaymentDate = dto.nextPaymentDate;
        if (dto.monthlyAmountPaid !== undefined)
            data.monthlyAmountPaid = dto.monthlyAmountPaid;
        if (dto.cancellationReason !== undefined)
            data.cancellationReason = dto.cancellationReason;
        if (dto.cancellationDate !== undefined)
            data.cancellationDate = dto.cancellationDate;
        const updated = await this.prisma.user_Subscriptions.update({
            where: { id },
            data,
        });
        return sanitize(updated);
    }
    async cancel(id, reason) {
        const existing = await this.prisma.user_Subscriptions.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Suscripción no encontrada');
        const updated = await this.prisma.user_Subscriptions.update({
            where: { id },
            data: {
                subscriptionStatus: 'CANCELADA',
                cancellationReason: reason ?? undefined,
                cancellationDate: new Date(),
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        await this.prisma.user_Subscriptions.delete({ where: { id } });
        return { ok: true };
    }
};
exports.UserSubscriptionsService = UserSubscriptionsService;
exports.UserSubscriptionsService = UserSubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserSubscriptionsService);
//# sourceMappingURL=user-subscriptions.service.js.map