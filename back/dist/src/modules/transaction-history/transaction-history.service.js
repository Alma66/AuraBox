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
exports.TransactionHistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(history) {
    if (!history)
        return history;
    ['totalAmountPaid', 'clubAmount', 'commissionAmount'].forEach((k) => {
        if (history[k] !== undefined && history[k] !== null) {
            try {
                history[k] = history[k].toString();
            }
            catch { }
        }
    });
    if (history.paymentDate instanceof Date)
        history.paymentDate = history.paymentDate.toISOString();
    return history;
}
let TransactionHistoryService = class TransactionHistoryService {
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
    async resolveClubId(item) {
        if (item.idClub)
            return item.idClub;
        const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: item.idUserSubscriptions } });
        if (!sub)
            return null;
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: sub.idSubscriptionTypes } });
        return subType?.idClub ?? null;
    }
    async assertTransactionAccess(item, user) {
        if (user.role === 'admin')
            return;
        if (user.role === 'customer' && item.idUser === user.id)
            return;
        if (user.role === 'entrepreneur') {
            const clubId = await this.resolveClubId(item);
            if (clubId) {
                await this.assertClubAccess(clubId, user);
                return;
            }
        }
        throw new common_1.ForbiddenException('No autorizado para ver esta transacción');
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: dto.idUserSubscriptions } });
        if (!sub)
            throw new common_1.NotFoundException('Suscripción no encontrada');
        if (sub.idUser !== dto.idUser)
            throw new common_1.NotFoundException('La suscripción no pertenece a este usuario');
        if (dto.idClub) {
            const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
            if (!club)
                throw new common_1.NotFoundException('Club no encontrado');
        }
        if (dto.idPaymentMethods) {
            const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethods } });
            if (!pm)
                throw new common_1.NotFoundException('Método de pago no encontrado');
        }
        const created = await this.prisma.transaction_History.create({
            data: {
                idUser: dto.idUser,
                idUserSubscriptions: dto.idUserSubscriptions,
                idGatewayTransaction: dto.idGatewayTransaction,
                idClub: dto.idClub,
                idPaymentMethods: dto.idPaymentMethods,
                totalAmountPaid: dto.totalAmountPaid,
                clubAmount: dto.clubAmount,
                commissionAmount: dto.commissionAmount,
                paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
                paymentStatus: dto.paymentStatus,
                paymentNotes: dto.paymentNotes,
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const histories = await this.prisma.transaction_History.findMany({ orderBy: { paymentDate: 'desc' } });
        return histories.map(sanitize);
    }
    async findOne(id, user) {
        const item = await this.prisma.transaction_History.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Registro de transacción no encontrado');
        await this.assertTransactionAccess(item, user);
        return sanitize(item);
    }
    async findByUser(idUser, user) {
        if (user.role !== 'admin' && user.id !== idUser) {
            throw new common_1.ForbiddenException('No autorizado para ver estas transacciones');
        }
        const histories = await this.prisma.transaction_History.findMany({
            where: { idUser },
            orderBy: { paymentDate: 'desc' },
        });
        return histories.map(sanitize);
    }
    async findBySubscription(idUserSubscriptions, user) {
        const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: idUserSubscriptions } });
        if (!sub)
            throw new common_1.NotFoundException('Suscripción no encontrada');
        if (user.role !== 'admin') {
            if (user.role === 'customer' && sub.idUser !== user.id) {
                throw new common_1.ForbiddenException('No autorizado para ver estas transacciones');
            }
            if (user.role === 'entrepreneur') {
                const subType = await this.prisma.subscription_Types.findUnique({ where: { id: sub.idSubscriptionTypes } });
                if (!subType)
                    throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
                await this.assertClubAccess(subType.idClub, user);
            }
        }
        const histories = await this.prisma.transaction_History.findMany({
            where: { idUserSubscriptions },
            orderBy: { paymentDate: 'desc' },
        });
        return histories.map(sanitize);
    }
    async findByClub(idClub, user) {
        await this.assertClubAccess(idClub, user);
        const histories = await this.prisma.transaction_History.findMany({
            where: { idClub },
            orderBy: { paymentDate: 'desc' },
        });
        return histories.map(sanitize);
    }
    async update(id, dto) {
        const item = await this.prisma.transaction_History.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Registro de transacción no encontrado');
        const updated = await this.prisma.transaction_History.update({
            where: { id },
            data: {
                ...dto,
                paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : item.paymentDate,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const item = await this.prisma.transaction_History.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Registro de transacción no encontrado');
        await this.prisma.transaction_History.delete({ where: { id } });
        return { message: 'Registro de transacción eliminado correctamente' };
    }
};
exports.TransactionHistoryService = TransactionHistoryService;
exports.TransactionHistoryService = TransactionHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionHistoryService);
//# sourceMappingURL=transaction-history.service.js.map