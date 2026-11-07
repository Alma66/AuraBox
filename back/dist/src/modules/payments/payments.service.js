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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const payments_constants_1 = require("./payments.constants");
function sanitize(payment) {
    if (!payment)
        return payment;
    ['totalAmountPaid', 'clubAmount', 'commissionAmount'].forEach((k) => {
        if (payment[k] !== undefined && payment[k] !== null) {
            try {
                payment[k] = payment[k].toString();
            }
            catch { }
        }
    });
    if (payment.paymentDate instanceof Date)
        payment.paymentDate = payment.paymentDate.toISOString();
    return payment;
}
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
    async create(dto) {
        const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: dto.idUserSubscription } });
        if (!sub)
            throw new common_1.NotFoundException('Suscripción no encontrada');
        if (sub.idUser !== dto.idUser) {
            throw new common_1.BadRequestException('La suscripción no pertenece al usuario indicado');
        }
        const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: sub.idSubscriptionTypes } });
        if (!subType || subType.idClub !== dto.idClub) {
            throw new common_1.BadRequestException('El club no coincide con el de la suscripción');
        }
        if (dto.idPaymentMethods) {
            const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethods } });
            if (!pm)
                throw new common_1.NotFoundException('Método de pago no encontrado');
        }
        const totalAmountPaid = Number(dto.totalAmountPaid);
        if (!Number.isFinite(totalAmountPaid) || totalAmountPaid <= payments_constants_1.AURABOX_COMMISSION) {
            throw new common_1.BadRequestException('El monto debe ser mayor a la comisión de la plataforma');
        }
        const commissionAmount = payments_constants_1.AURABOX_COMMISSION;
        const clubAmount = totalAmountPaid - commissionAmount;
        const data = {
            idUserSubscription: dto.idUserSubscription,
            idUser: dto.idUser,
            idClub: dto.idClub,
            paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
            paymentStatus: dto.paymentStatus,
            totalAmountPaid: String(totalAmountPaid),
            clubAmount: String(clubAmount),
            commissionAmount: String(commissionAmount),
        };
        if (dto.idGatewayTransaction !== undefined && dto.idGatewayTransaction !== null) {
            data.idGatewayTransaction = String(dto.idGatewayTransaction);
        }
        if (dto.idPaymentMethods !== undefined)
            data.idPaymentMethods = dto.idPaymentMethods;
        const created = await this.prisma.payment.create({ data });
        return sanitize(created);
    }
    async findAll() {
        const payments = await this.prisma.payment.findMany({
            orderBy: { paymentDate: 'desc' },
        });
        return payments.map(sanitize);
    }
    async findOneForUser(id, user) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment)
            throw new common_1.NotFoundException('Pago no encontrado');
        if (user.role === 'admin')
            return sanitize(payment);
        if (user.role === 'customer' && payment.idUser === user.id)
            return sanitize(payment);
        if (user.role === 'entrepreneur') {
            await this.assertClubAccess(payment.idClub, user);
            return sanitize(payment);
        }
        throw new common_1.ForbiddenException('No autorizado para ver este pago');
    }
    async findByUser(idUser) {
        const payments = await this.prisma.payment.findMany({
            where: { idUser },
            orderBy: { paymentDate: 'desc' },
        });
        return payments.map(sanitize);
    }
    async findByClub(idClub, user) {
        await this.assertClubAccess(idClub, user);
        const payments = await this.prisma.payment.findMany({
            where: { idClub },
            orderBy: { paymentDate: 'desc' },
        });
        const methodIds = Array.from(new Set(payments.map((p) => p.idPaymentMethods).filter((id) => typeof id === 'number')));
        const methods = methodIds.length
            ? await this.prisma.payment_Methods.findMany({ where: { id: { in: methodIds } } })
            : [];
        const codeById = new Map(methods.map((m) => [m.id, (0, payments_constants_1.codeFromMethodName)(m.method)]));
        return payments.map((p) => ({
            ...sanitize(p),
            paymentMethodCode: p.idPaymentMethods ? (codeById.get(p.idPaymentMethods) ?? null) : null,
        }));
    }
    async update(id, dto) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment)
            throw new common_1.NotFoundException('Pago no encontrado');
        const data = {};
        if (dto.paymentDate !== undefined) {
            data.paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : payment.paymentDate;
        }
        if (dto.paymentStatus !== undefined)
            data.paymentStatus = dto.paymentStatus;
        if (dto.idUserSubscription !== undefined)
            data.idUserSubscription = dto.idUserSubscription;
        if (dto.idUser !== undefined)
            data.idUser = dto.idUser;
        if (dto.idClub !== undefined)
            data.idClub = dto.idClub;
        if (dto.idGatewayTransaction !== undefined && dto.idGatewayTransaction !== null) {
            data.idGatewayTransaction = String(dto.idGatewayTransaction);
        }
        else if (dto.idGatewayTransaction === null) {
            data.idGatewayTransaction = null;
        }
        if (dto.idPaymentMethods !== undefined)
            data.idPaymentMethods = dto.idPaymentMethods;
        if (dto.totalAmountPaid !== undefined)
            data.totalAmountPaid = dto.totalAmountPaid !== null ? String(dto.totalAmountPaid) : null;
        if (dto.clubAmount !== undefined)
            data.clubAmount = dto.clubAmount !== null ? String(dto.clubAmount) : null;
        if (dto.commissionAmount !== undefined)
            data.commissionAmount = dto.commissionAmount !== null ? String(dto.commissionAmount) : null;
        const updated = await this.prisma.payment.update({
            where: { id },
            data,
        });
        return sanitize(updated);
    }
    async settle(id, action, user) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment)
            throw new common_1.NotFoundException('Pago no encontrado');
        await this.assertClubAccess(payment.idClub, user);
        const method = payment.idPaymentMethods
            ? await this.prisma.payment_Methods.findUnique({ where: { id: payment.idPaymentMethods } })
            : null;
        if (!method || (0, payments_constants_1.codeFromMethodName)(method.method) !== 'efectivo') {
            throw new common_1.BadRequestException('Solo se pueden resolver desde acá los pagos en efectivo');
        }
        const now = new Date();
        await this.prisma.$transaction(async (tx) => {
            const updated = await tx.payment.updateMany({
                where: { id, paymentStatus: 'Pendiente' },
                data: action === 'confirm'
                    ? { paymentStatus: 'Exitoso', paymentDate: now, idGatewayTransaction: `EFE-${now.getTime()}-${id}` }
                    : { paymentStatus: 'Rechazado' },
            });
            if (updated.count !== 1)
                throw new common_1.BadRequestException('Este pago ya fue resuelto');
            if (action === 'confirm') {
                await tx.user_Subscriptions.update({
                    where: { id: payment.idUserSubscription },
                    data: { lastPaymentDate: now, monthlyAmountPaid: payment.totalAmountPaid.toString() },
                });
            }
        });
        const refreshed = await this.prisma.payment.findUnique({ where: { id } });
        return sanitize(refreshed);
    }
    async remove(id) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment)
            throw new common_1.NotFoundException('Pago no encontrado');
        await this.prisma.payment.delete({ where: { id } });
        return { message: 'Pago eliminado correctamente' };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map