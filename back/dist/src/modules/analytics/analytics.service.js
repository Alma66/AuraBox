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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const STOPWORDS = new Set([
    'que', 'de', 'la', 'el', 'y', 'en', 'un', 'una', 'los', 'las', 'del', 'al',
    'es', 'se', 'no', 'con', 'por', 'su', 'para', 'como', 'más', 'pero', 'sus',
    'le', 'ya', 'o', 'fue', 'este', 'ha', 'lo', 'si', 'porque', 'me', 'muy',
    'sin', 'sobre', 'también', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo',
    'nos', 'durante', 'estados', 'todos', 'uno', 'les', 'ni', 'contra', 'otros',
    'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos',
    'qué', 'unos', 'yo', 'otro', 'otras', 'él', 'tanto', 'esa', 'estos', 'mucho',
    'quienes', 'nada', 'muchos', 'cual', 'sea', 'poco', 'ella', 'estar', 'estas',
    'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus',
    'fue', 'ser', 'era', 'son',
]);
function last12Months() {
    const now = new Date();
    const result = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        result.push({ key, year: d.getFullYear(), month: d.getMonth() + 1 });
    }
    return result;
}
function sanitizeDecimal(val) {
    if (val === null || val === undefined)
        return '0';
    return val.toString();
}
function sanitizeDate(val) {
    if (!val)
        return null;
    return val instanceof Date ? val.toISOString() : String(val);
}
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getClubStats(idClub) {
        const subTypes = await this.prisma.subscription_Types.findMany({
            where: { idClub },
            select: { id: true, name: true },
        });
        const subTypeIds = subTypes.map((s) => s.id);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [allSubs, reviews, shipments] = await Promise.all([
            this.prisma.user_Subscriptions.findMany({
                where: { idSubscriptionTypes: { in: subTypeIds } },
                select: {
                    id: true,
                    subscriptionStatus: true,
                    startDate: true,
                    cancellationDate: true,
                    expectedEndDate: true,
                    monthlyAmountPaid: true,
                    idSubscriptionTypes: true,
                },
            }),
            this.prisma.reviews.findMany({
                where: { idClub, isHidden: false },
                select: { id: true, rating: true, mediaUrl: true, isHidden: true },
            }),
            this.prisma.shipments.findMany({
                where: {
                    idClub,
                    shipmentStatus: { not: undefined },
                },
                select: { shipmentStatus: true, idClub: true },
            }),
        ]);
        const activeSubs = allSubs.filter((s) => s.subscriptionStatus === 'Activa');
        const cancelledSubs = allSubs.filter((s) => s.subscriptionStatus === 'Cancelada');
        const newThisMonth = allSubs.filter((s) => new Date(s.startDate) >= startOfMonth).length;
        const cancelledThisMonth = cancelledSubs.filter((s) => s.cancellationDate && new Date(s.cancellationDate) >= startOfMonth).length;
        const total = activeSubs.length + cancelledSubs.length;
        const retentionRate = total > 0 ? Math.round((activeSubs.length / total) * 100) : 0;
        const mrr = activeSubs.reduce((sum, s) => sum + Number(sanitizeDecimal(s.monthlyAmountPaid)), 0);
        const avgTicket = activeSubs.length > 0 ? mrr / activeSubs.length : 0;
        const months = last12Months();
        const subscriberEvolution = months.map(({ key, year, month }) => {
            const count = allSubs.filter((s) => {
                const start = new Date(s.startDate);
                const end = s.cancellationDate
                    ? new Date(s.cancellationDate)
                    : s.expectedEndDate
                        ? new Date(s.expectedEndDate)
                        : new Date(9999, 11, 31);
                const monthStart = new Date(year, month - 1, 1);
                const monthEnd = new Date(year, month, 0, 23, 59, 59);
                return start <= monthEnd && end >= monthStart;
            }).length;
            return { month: key, count };
        });
        const shipmentStatusMap = {};
        for (const s of shipments) {
            const st = String(s.shipmentStatus);
            shipmentStatusMap[st] = (shipmentStatusMap[st] ?? 0) + 1;
        }
        const shipmentStatusBreakdown = Object.entries(shipmentStatusMap).map(([status, count]) => ({ status, count }));
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
        const withMedia = reviews.filter((r) => r.mediaUrl).length;
        const withMediaPercent = totalReviews > 0 ? Math.round((withMedia / totalReviews) * 100) : 0;
        const hiddenCount = await this.prisma.reviews.count({ where: { idClub, isHidden: true } });
        const subTypeCountMap = {};
        for (const s of activeSubs) {
            subTypeCountMap[s.idSubscriptionTypes] = (subTypeCountMap[s.idSubscriptionTypes] ?? 0) + 1;
        }
        const topSubscriptionTypes = subTypes
            .map((st) => ({ name: st.name, activeCount: subTypeCountMap[st.id] ?? 0 }))
            .sort((a, b) => b.activeCount - a.activeCount)
            .slice(0, 5);
        return {
            activeSubscribers: activeSubs.length,
            newThisMonth,
            cancelledThisMonth,
            retentionRate,
            avgTicket: avgTicket.toFixed(2),
            mrr: mrr.toFixed(2),
            subscriberEvolution,
            shipmentStatusBreakdown,
            reputationSummary: {
                avgRating: Number(avgRating.toFixed(2)),
                totalReviews,
                withMediaPercent,
                hiddenCount,
            },
            topSubscriptionTypes,
        };
    }
    async getSalesReport(idClub, filters) {
        const where = { idClub };
        if (filters.from)
            where.paymentDate = { ...where.paymentDate, gte: new Date(filters.from) };
        if (filters.to)
            where.paymentDate = { ...where.paymentDate, lte: new Date(filters.to + 'T23:59:59') };
        if (filters.paymentStatus)
            where.paymentStatus = filters.paymentStatus;
        if (filters.idPaymentMethods)
            where.idPaymentMethods = filters.idPaymentMethods;
        if (filters.idSubscriptionTypes) {
            const matchingSubs = await this.prisma.user_Subscriptions.findMany({
                where: { idSubscriptionTypes: filters.idSubscriptionTypes },
                select: { id: true },
            });
            where.idUserSubscription = { in: matchingSubs.map((s) => s.id) };
        }
        const [allPayments, totalCount] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                orderBy: { paymentDate: 'desc' },
                skip: (filters.page - 1) * filters.pageSize,
                take: filters.pageSize,
            }),
            this.prisma.payment.count({ where }),
        ]);
        const allForSummary = await this.prisma.payment.findMany({ where });
        const successfulPayments = allForSummary.filter((p) => p.paymentStatus === 'Exitoso');
        const totalRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.clubAmount), 0);
        const avgTicket = successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0;
        const months = last12Months();
        const now = new Date();
        const monthlyRevenue = months.map(({ key, year, month }) => {
            const monthStart = new Date(year, month - 1, 1);
            const monthEnd = new Date(year, month, 0, 23, 59, 59);
            const prevStart = new Date(year, month - 2, 1);
            const prevEnd = new Date(year, month - 1, 0, 23, 59, 59);
            const current = allForSummary
                .filter((p) => p.paymentStatus === 'Exitoso' && new Date(p.paymentDate) >= monthStart && new Date(p.paymentDate) <= monthEnd)
                .reduce((sum, p) => sum + Number(p.clubAmount), 0);
            const previous = allForSummary
                .filter((p) => p.paymentStatus === 'Exitoso' && new Date(p.paymentDate) >= prevStart && new Date(p.paymentDate) <= prevEnd)
                .reduce((sum, p) => sum + Number(p.clubAmount), 0);
            return { month: key, current: Number(current.toFixed(2)), previous: Number(previous.toFixed(2)) };
        });
        const methodMap = {};
        for (const p of allForSummary.filter((p) => p.paymentStatus === 'Exitoso')) {
            const m = String(p.idPaymentMethods ?? 'Desconocido');
            methodMap[m] = (methodMap[m] ?? 0) + Number(p.clubAmount);
        }
        const byPaymentMethod = Object.entries(methodMap).map(([method, amount]) => ({
            method,
            amount: Number(amount.toFixed(2)),
        }));
        const subTypeIds = filters.idSubscriptionTypes
            ? [filters.idSubscriptionTypes]
            : (await this.prisma.subscription_Types.findMany({ where: { idClub }, select: { id: true, name: true } })).map((s) => s.id);
        const subTypes = await this.prisma.subscription_Types.findMany({
            where: { id: { in: subTypeIds } },
            select: { id: true, name: true },
        });
        const subTypesForClub = await this.prisma.subscription_Types.findMany({
            where: { idClub },
            select: { id: true, name: true },
        });
        const subTypeMap = new Map(subTypesForClub.map((s) => [s.id, s.name]));
        const allSubsForPayments = await this.prisma.user_Subscriptions.findMany({
            where: { idSubscriptionTypes: { in: subTypesForClub.map((s) => s.id) } },
            select: { id: true, idSubscriptionTypes: true },
        });
        const subIdToTypeId = new Map(allSubsForPayments.map((s) => [s.id, s.idSubscriptionTypes]));
        const typeRevenueMap = {};
        for (const p of allForSummary.filter((p) => p.paymentStatus === 'Exitoso')) {
            const typeId = subIdToTypeId.get(p.idUserSubscription);
            const typeName = typeId ? (subTypeMap.get(typeId) ?? 'Desconocido') : 'Desconocido';
            typeRevenueMap[typeName] = (typeRevenueMap[typeName] ?? 0) + Number(p.clubAmount);
        }
        const bySubscriptionType = Object.entries(typeRevenueMap).map(([name, amount]) => ({
            name,
            amount: Number(amount.toFixed(2)),
        }));
        const payments = allPayments.map((p) => ({
            id: p.id,
            paymentDate: sanitizeDate(p.paymentDate),
            idUser: p.idUser,
            idUserSubscription: p.idUserSubscription,
            idPaymentMethods: p.idPaymentMethods,
            totalAmountPaid: sanitizeDecimal(p.totalAmountPaid),
            clubAmount: sanitizeDecimal(p.clubAmount),
            commissionAmount: sanitizeDecimal(p.commissionAmount),
            paymentStatus: p.paymentStatus,
            idGatewayTransaction: p.idGatewayTransaction,
        }));
        return {
            totalRevenue: totalRevenue.toFixed(2),
            successfulPaymentsCount: successfulPayments.length,
            avgTicket: avgTicket.toFixed(2),
            monthlyRevenue,
            byPaymentMethod,
            bySubscriptionType,
            payments,
            totalCount,
        };
    }
    async getSalesReportExport(idClub, filters) {
        const where = { idClub };
        if (filters.from)
            where.paymentDate = { ...where.paymentDate, gte: new Date(filters.from) };
        if (filters.to)
            where.paymentDate = { ...where.paymentDate, lte: new Date(filters.to + 'T23:59:59') };
        if (filters.paymentStatus)
            where.paymentStatus = filters.paymentStatus;
        if (filters.idPaymentMethods)
            where.idPaymentMethods = filters.idPaymentMethods;
        if (filters.idSubscriptionTypes) {
            const matchingSubs = await this.prisma.user_Subscriptions.findMany({
                where: { idSubscriptionTypes: filters.idSubscriptionTypes },
                select: { id: true },
            });
            where.idUserSubscription = { in: matchingSubs.map((s) => s.id) };
        }
        const payments = await this.prisma.payment.findMany({ where, orderBy: { paymentDate: 'desc' } });
        return payments.map((p) => ({
            id: p.id,
            fecha: sanitizeDate(p.paymentDate),
            idUsuario: p.idUser,
            idSuscripcion: p.idUserSubscription,
            metodoPago: p.idPaymentMethods ?? '',
            montoTotal: sanitizeDecimal(p.totalAmountPaid),
            montoClub: sanitizeDecimal(p.clubAmount),
            comision: sanitizeDecimal(p.commissionAmount),
            estado: p.paymentStatus,
            transaccion: p.idGatewayTransaction ?? '',
        }));
    }
    async getFeedbackTrends(idClub) {
        const subTypes = await this.prisma.subscription_Types.findMany({
            where: { idClub },
            select: { id: true },
        });
        const subTypeIds = subTypes.map((s) => s.id);
        const [reviews, allSubs] = await Promise.all([
            this.prisma.reviews.findMany({
                where: { idClub, isHidden: false },
                select: { id: true, rating: true, reviewDate: true, comment: true, title: true, mediaUrl: true, idUser: true },
                orderBy: { reviewDate: 'desc' },
            }),
            this.prisma.user_Subscriptions.findMany({
                where: { idSubscriptionTypes: { in: subTypeIds } },
                select: { id: true, startDate: true, cancellationDate: true, subscriptionStatus: true },
            }),
        ]);
        const months = last12Months();
        const ratingEvolution = months.map(({ key, year, month }) => {
            const monthStart = new Date(year, month - 1, 1);
            const monthEnd = new Date(year, month, 0, 23, 59, 59);
            const monthReviews = reviews.filter((r) => {
                const d = new Date(r.reviewDate);
                return d >= monthStart && d <= monthEnd;
            });
            const avg = monthReviews.length > 0 ? monthReviews.reduce((s, r) => s + r.rating, 0) / monthReviews.length : 0;
            return { month: key, avgRating: Number(avg.toFixed(2)) };
        });
        const reviewConversionRate = allSubs.length > 0 ? Number(((reviews.length / allSubs.length) * 100).toFixed(2)) : 0;
        const subscriberFlux = months.map(({ key, year, month }) => {
            const monthStart = new Date(year, month - 1, 1);
            const monthEnd = new Date(year, month, 0, 23, 59, 59);
            const newSubs = allSubs.filter((s) => {
                const d = new Date(s.startDate);
                return d >= monthStart && d <= monthEnd;
            }).length;
            const cancelledSubs = allSubs.filter((s) => {
                if (!s.cancellationDate)
                    return false;
                const d = new Date(s.cancellationDate);
                return d >= monthStart && d <= monthEnd;
            }).length;
            return { month: key, newSubs, cancelledSubs };
        });
        const topReviews = reviews
            .filter((r) => r.rating >= 4)
            .slice(0, 3)
            .map((r) => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            reviewDate: sanitizeDate(r.reviewDate),
            idUser: r.idUser,
            mediaUrl: r.mediaUrl,
        }));
        const bottomReviews = reviews
            .filter((r) => r.rating <= 2)
            .slice(0, 3)
            .map((r) => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            reviewDate: sanitizeDate(r.reviewDate),
            idUser: r.idUser,
            mediaUrl: r.mediaUrl,
        }));
        const wordCount = new Map();
        for (const r of reviews) {
            const text = `${r.title ?? ''} ${r.comment ?? ''}`.toLowerCase();
            const words = text.split(/[\s,.:;!?¿¡()\-"']+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
            for (const w of words) {
                wordCount.set(w, (wordCount.get(w) ?? 0) + 1);
            }
        }
        const frequentWords = Array.from(wordCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
        return {
            ratingEvolution,
            reviewConversionRate,
            subscriberFlux,
            topReviews,
            bottomReviews,
            frequentWords,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map