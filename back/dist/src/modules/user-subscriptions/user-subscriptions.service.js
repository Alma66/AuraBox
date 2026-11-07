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
const client_1 = require("@prisma/client");
const billing_1 = require("../../common/utils/billing");
const ALLOWED_TRANSITIONS = {
    Activa: ['Pausada', 'Pendiente_Pago', 'Cancelada', 'Finalizada'],
    Pausada: ['Activa', 'Cancelada', 'Finalizada'],
    Pendiente_Pago: ['Activa', 'Cancelada'],
    Cancelada: [],
    Finalizada: [],
};
const CLOSED_STATUSES = ['Cancelada', 'Finalizada'];
const MAX_REASON_LENGTH = 500;
const cleanReason = (value) => typeof value === 'string' && value.trim() ? value.trim().slice(0, MAX_REASON_LENGTH) : undefined;
const statusLabel = (value) => value.replace('_', ' ');
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
    async assertEntrepreneurOwnsSubscription(idSubscriptionTypes, entrepreneurId) {
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
        if (!subType)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        const assoc = await this.prisma.entrepreneur_Club.findFirst({
            where: { idClub: subType.idClub, idEntrepreneurs: entrepreneurId },
        });
        if (!assoc)
            throw new common_1.ForbiddenException('No tenés acceso a esta suscripción');
    }
    async create(dto, actingUser) {
        const userId = actingUser.role === 'admin' && dto.idUser ? dto.idUser : actingUser.id;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const sType = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
        if (!sType)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        if (actingUser.role !== 'admin') {
            if (!sType.active)
                throw new common_1.BadRequestException('Este plan ya no está disponible');
            const club = await this.prisma.club.findUnique({ where: { id: sType.idClub } });
            if (!club || club.clubStatus !== 'APROBADO')
                throw new common_1.BadRequestException('Este club no está disponible');
        }
        if (dto.idPaymentMethods) {
            const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethods } });
            if (!pm)
                throw new common_1.NotFoundException('Método de pago no encontrado');
        }
        const existing = await this.prisma.user_Subscriptions.findFirst({
            where: {
                idUser: userId,
                idSubscriptionTypes: dto.idSubscriptionTypes,
                subscriptionStatus: { notIn: CLOSED_STATUSES },
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
            subscriptionStatus: 'Activa',
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
    async findOneForRequester(id, user) {
        const sub = await this.findById(id);
        if (user.role === 'admin')
            return sub;
        if (user.role === 'customer' && sub.idUser === user.id)
            return sub;
        if (user.role === 'entrepreneur') {
            await this.assertEntrepreneurOwnsSubscription(sub.idSubscriptionTypes, user.id);
            return sub;
        }
        throw new common_1.ForbiddenException('No autorizado para ver esta suscripción');
    }
    async findByUser(userId) {
        const rows = await this.prisma.user_Subscriptions.findMany({
            where: { idUser: userId },
            orderBy: { startDate: 'desc' },
        });
        return rows.map((r) => sanitize(r));
    }
    async updateForRequester(id, dto, user) {
        const existing = await this.prisma.user_Subscriptions.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Suscripción no encontrada');
        if (user.role === 'entrepreneur') {
            await this.assertEntrepreneurOwnsSubscription(existing.idSubscriptionTypes, user.id);
            const next = dto.subscriptionStatus;
            if (next !== undefined && next !== existing.subscriptionStatus) {
                const allowed = ALLOWED_TRANSITIONS[existing.subscriptionStatus] ?? [];
                if (!allowed.includes(next)) {
                    throw new common_1.BadRequestException(`No se puede pasar una suscripción de ${statusLabel(existing.subscriptionStatus)} a ${statusLabel(next)}`);
                }
            }
            return this.update(id, {
                subscriptionStatus: dto.subscriptionStatus,
                cancellationReason: cleanReason(dto.cancellationReason),
            });
        }
        return this.update(id, dto);
    }
    async update(id, dto) {
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
        const next = dto.subscriptionStatus;
        const now = new Date();
        const wasPending = existing.subscriptionStatus === 'Pendiente_Pago';
        const wasPaused = existing.subscriptionStatus === 'Pausada';
        let paymentUpdate = null;
        if (next === 'Cancelada' && existing.subscriptionStatus !== 'Cancelada') {
            data.cancellationDate = dto.cancellationDate ?? now;
        }
        else if (next !== undefined && next !== 'Cancelada' && existing.subscriptionStatus === 'Cancelada') {
            data.cancellationDate = null;
            data.cancellationReason = null;
        }
        const plan = next === 'Activa' && (wasPending || wasPaused)
            ? await this.prisma.subscription_Types.findUnique({ where: { id: existing.idSubscriptionTypes } })
            : null;
        if (wasPending && (next === 'Activa' || next === 'Cancelada')) {
            const pendingPayment = await this.prisma.payment.findFirst({
                where: { idUserSubscription: id, paymentStatus: 'Pendiente' },
                orderBy: { paymentDate: 'desc' },
            });
            if (pendingPayment) {
                if (next === 'Activa') {
                    paymentUpdate = this.prisma.payment.update({
                        where: { id: pendingPayment.id },
                        data: { paymentStatus: 'Exitoso', paymentDate: now },
                    });
                    if (data.monthlyAmountPaid === undefined) {
                        data.monthlyAmountPaid = pendingPayment.totalAmountPaid.toString();
                    }
                }
                else {
                    paymentUpdate = this.prisma.payment.update({
                        where: { id: pendingPayment.id },
                        data: { paymentStatus: 'Rechazado' },
                    });
                }
            }
            if (next === 'Activa') {
                if (data.lastPaymentDate === undefined)
                    data.lastPaymentDate = now;
                if (data.nextPaymentDate === undefined && plan) {
                    const upcoming = (0, billing_1.nextPaymentFrom)(now, plan.frequency);
                    if (upcoming)
                        data.nextPaymentDate = upcoming;
                }
            }
        }
        if (wasPaused && next === 'Activa' && plan && data.nextPaymentDate === undefined) {
            const stillFuture = !!existing.nextPaymentDate && existing.nextPaymentDate.getTime() > now.getTime();
            if (!stillFuture) {
                const upcoming = (0, billing_1.nextPaymentFrom)(now, plan.frequency);
                if (upcoming)
                    data.nextPaymentDate = upcoming;
            }
        }
        const subscriptionUpdate = this.prisma.user_Subscriptions.update({ where: { id }, data });
        if (paymentUpdate) {
            const [updated] = await this.prisma.$transaction([subscriptionUpdate, paymentUpdate]);
            return sanitize(updated);
        }
        const updated = await subscriptionUpdate;
        return sanitize(updated);
    }
    async cancel(id, reason) {
        const existing = await this.prisma.user_Subscriptions.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Suscripción no encontrada');
        if (CLOSED_STATUSES.includes(existing.subscriptionStatus)) {
            throw new common_1.BadRequestException('Esta suscripción ya está cerrada');
        }
        const updated = await this.prisma.user_Subscriptions.update({
            where: { id },
            data: {
                subscriptionStatus: 'Cancelada',
                cancellationReason: cleanReason(reason),
                cancellationDate: new Date(),
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        try {
            await this.prisma.user_Subscriptions.delete({ where: { id } });
            return { ok: true };
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                throw new common_1.NotFoundException('Suscripción no encontrada');
            }
            throw err;
        }
    }
};
exports.UserSubscriptionsService = UserSubscriptionsService;
exports.UserSubscriptionsService = UserSubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserSubscriptionsService);
//# sourceMappingURL=user-subscriptions.service.js.map