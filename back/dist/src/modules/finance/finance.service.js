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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function monthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
let FinanceService = class FinanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMovements(idClub) {
        const movements = [];
        const payments = await this.prisma.payment.findMany({
            where: { idClub, paymentStatus: 'Exitoso' },
            orderBy: { paymentDate: 'desc' },
        });
        for (const p of payments) {
            movements.push({
                id: `payment-income-${p.id}`,
                source: 'payment_income',
                date: p.paymentDate.toISOString(),
                type: 'Ingreso',
                category: 'Suscripciones',
                description: `Pago de suscripción #${p.idUserSubscription}`,
                amount: Number(p.clubAmount),
                status: 'Confirmado',
                editable: false,
            });
            movements.push({
                id: `payment-commission-${p.id}`,
                source: 'payment_commission',
                date: p.paymentDate.toISOString(),
                type: 'Egreso',
                category: 'Comisión AuraBox',
                description: `Comisión AuraBox sobre pago #${p.idUserSubscription}`,
                amount: Number(p.commissionAmount),
                status: 'Confirmado',
                editable: false,
            });
        }
        const orders = await this.prisma.supply_Order.findMany({
            where: { idClub, status: 'Recibido' },
            orderBy: { orderDate: 'desc' },
        });
        const products = await this.prisma.product_Inventory.findMany({
            where: { idClub },
            select: { id: true, name: true },
        });
        const productNameById = new Map(products.map((p) => [p.id, p.name]));
        for (const o of orders) {
            movements.push({
                id: `supply-order-${o.id}`,
                source: 'supply_order',
                date: (o.receivedDate ?? o.orderDate).toISOString(),
                type: 'Egreso',
                category: 'Proveedores e Insumos',
                description: `Pedido de ${productNameById.get(o.idProductInventory) ?? 'insumo'}`,
                amount: Number(o.totalCost),
                status: 'Pagado',
                editable: false,
            });
        }
        const manual = await this.prisma.financial_Entry.findMany({
            where: { idClub },
            orderBy: { entryDate: 'desc' },
        });
        for (const m of manual) {
            movements.push({
                id: `manual-${m.id}`,
                source: 'manual',
                date: m.entryDate.toISOString(),
                type: m.type === 'Ingreso' ? 'Ingreso' : 'Egreso',
                category: m.category,
                description: m.description,
                amount: Number(m.amount),
                status: m.status,
                editable: true,
            });
        }
        movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const monthlyTotals = {};
        for (const mv of movements) {
            const key = monthKey(new Date(mv.date));
            if (!monthlyTotals[key])
                monthlyTotals[key] = { ingresos: 0, egresos: 0, balance: 0 };
            if (mv.type === 'Ingreso')
                monthlyTotals[key].ingresos += mv.amount;
            else
                monthlyTotals[key].egresos += mv.amount;
            monthlyTotals[key].balance = monthlyTotals[key].ingresos - monthlyTotals[key].egresos;
        }
        const totalIngresos = movements.filter((m) => m.type === 'Ingreso').reduce((s, m) => s + m.amount, 0);
        const totalEgresos = movements.filter((m) => m.type === 'Egreso').reduce((s, m) => s + m.amount, 0);
        return {
            movements,
            monthlyTotals,
            summary: {
                totalIngresos,
                totalEgresos,
                balance: totalIngresos - totalEgresos,
                totalAuraboxCommission: movements.filter((m) => m.source === 'payment_commission').reduce((s, m) => s + m.amount, 0),
                totalSupplyExpenses: movements.filter((m) => m.source === 'supply_order').reduce((s, m) => s + m.amount, 0),
            },
        };
    }
    async getProfitability(idClub) {
        const subscriptionTypes = await this.prisma.subscription_Types.findMany({ where: { idClub } });
        const subTypeIds = subscriptionTypes.map((s) => s.id);
        const userSubs = await this.prisma.user_Subscriptions.findMany({
            where: { idSubscriptionTypes: { in: subTypeIds } },
            select: { id: true, idSubscriptionTypes: true, subscriptionStatus: true },
        });
        const subTypeByUserSubId = new Map(userSubs.map((us) => [us.id, us.idSubscriptionTypes]));
        const activeCountByType = {};
        for (const us of userSubs) {
            if (us.subscriptionStatus === 'Activa') {
                activeCountByType[us.idSubscriptionTypes] = (activeCountByType[us.idSubscriptionTypes] ?? 0) + 1;
            }
        }
        const payments = await this.prisma.payment.findMany({ where: { idClub, paymentStatus: 'Exitoso' } });
        const revenueByType = {};
        const commissionByType = {};
        for (const p of payments) {
            const typeId = subTypeByUserSubId.get(p.idUserSubscription);
            if (!typeId)
                continue;
            revenueByType[typeId] = (revenueByType[typeId] ?? 0) + Number(p.clubAmount);
            commissionByType[typeId] = (commissionByType[typeId] ?? 0) + Number(p.commissionAmount);
        }
        const shipments = await this.prisma.shipments.findMany({
            where: { idClub },
            select: { idUserSubscriptions: true, shippingCost: true },
        });
        const shippingByType = {};
        for (const s of shipments) {
            const typeId = subTypeByUserSubId.get(s.idUserSubscriptions);
            if (!typeId || !s.shippingCost)
                continue;
            shippingByType[typeId] = (shippingByType[typeId] ?? 0) + Number(s.shippingCost);
        }
        const supplyOrders = await this.prisma.supply_Order.findMany({ where: { idClub, status: 'Recibido' } });
        const totalSupplyCost = supplyOrders.reduce((s, o) => s + Number(o.totalCost), 0);
        const totalRevenueAllTypes = Object.values(revenueByType).reduce((s, v) => s + v, 0);
        const breakdown = subscriptionTypes.map((st) => {
            const revenue = revenueByType[st.id] ?? 0;
            const commission = commissionByType[st.id] ?? 0;
            const shipping = shippingByType[st.id] ?? 0;
            const revenueShare = totalRevenueAllTypes > 0 ? revenue / totalRevenueAllTypes : 0;
            const allocatedInventoryCost = totalSupplyCost * revenueShare;
            const netMargin = revenue - commission - shipping - allocatedInventoryCost;
            return {
                idSubscriptionType: st.id,
                name: st.name,
                basePrice: Number(st.basePrice),
                activeSubscribers: activeCountByType[st.id] ?? 0,
                revenue,
                auraboxCommission: commission,
                shippingCost: shipping,
                allocatedInventoryCost,
                netMargin,
                marginPercent: revenue > 0 ? (netMargin / revenue) * 100 : 0,
            };
        });
        return {
            breakdown,
            totals: {
                totalRevenue: totalRevenueAllTypes,
                totalCommission: Object.values(commissionByType).reduce((s, v) => s + v, 0),
                totalShipping: Object.values(shippingByType).reduce((s, v) => s + v, 0),
                totalInventoryCost: totalSupplyCost,
                totalNetMargin: breakdown.reduce((s, b) => s + b.netMargin, 0),
            },
        };
    }
    async createEntry(dto) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        return this.prisma.financial_Entry.create({
            data: {
                idClub: dto.idClub,
                type: dto.type,
                category: dto.category,
                description: dto.description,
                amount: dto.amount,
                entryDate: dto.entryDate ? new Date(dto.entryDate) : new Date(),
                status: dto.status ?? 'Confirmado',
            },
        });
    }
    async updateEntry(id, dto) {
        const entry = await this.prisma.financial_Entry.findUnique({ where: { id } });
        if (!entry)
            throw new common_1.NotFoundException('Movimiento no encontrado');
        const data = { ...dto };
        if (dto.entryDate !== undefined)
            data.entryDate = new Date(dto.entryDate);
        return this.prisma.financial_Entry.update({ where: { id }, data });
    }
    async removeEntry(id) {
        const entry = await this.prisma.financial_Entry.findUnique({ where: { id } });
        if (!entry)
            throw new common_1.NotFoundException('Movimiento no encontrado');
        await this.prisma.financial_Entry.delete({ where: { id } });
        return { message: 'Movimiento eliminado correctamente' };
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map