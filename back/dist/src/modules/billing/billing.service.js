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
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const payments_constants_1 = require("../payments/payments.constants");
const billing_1 = require("../../common/utils/billing");
const shipping_1 = require("../../common/utils/shipping");
const RUN_EVERY_MS = 60 * 60 * 1000;
const FIRST_RUN_DELAY_MS = 15 * 1000;
const BATCH_SIZE = 500;
let BillingService = BillingService_1 = class BillingService {
    prisma;
    logger = new common_1.Logger(BillingService_1.name);
    timer = null;
    firstRun = null;
    running = false;
    constructor(prisma) {
        this.prisma = prisma;
    }
    onModuleInit() {
        if (process.env.BILLING_CRON === 'off')
            return;
        this.firstRun = setTimeout(() => this.run(), FIRST_RUN_DELAY_MS);
        this.timer = setInterval(() => this.run(), RUN_EVERY_MS);
        this.firstRun.unref();
        this.timer.unref();
    }
    onModuleDestroy() {
        if (this.firstRun)
            clearTimeout(this.firstRun);
        if (this.timer)
            clearInterval(this.timer);
    }
    async run() {
        if (this.running)
            return { renewed: 0, scheduled: 0, skipped: 0 };
        this.running = true;
        try {
            const result = await this.processDueRenewals();
            if (result.renewed > 0 || result.scheduled > 0) {
                this.logger.log(`Cobros: ${result.renewed} renovados, ${result.scheduled} programados, ${result.skipped} omitidos`);
            }
            return result;
        }
        catch (error) {
            this.logger.error('Error al procesar los cobros recurrentes', error);
            return { renewed: 0, scheduled: 0, skipped: 0 };
        }
        finally {
            this.running = false;
        }
    }
    async processDueRenewals() {
        const now = new Date();
        let renewed = 0;
        let scheduled = 0;
        let skipped = 0;
        const legacy = await this.prisma.user_Subscriptions.findMany({
            where: { subscriptionStatus: 'Activa', nextPaymentDate: null },
            take: BATCH_SIZE,
        });
        const due = await this.prisma.user_Subscriptions.findMany({
            where: { subscriptionStatus: 'Activa', nextPaymentDate: { lte: now } },
            orderBy: { nextPaymentDate: 'asc' },
            take: BATCH_SIZE,
        });
        if (legacy.length === 0 && due.length === 0)
            return { renewed, scheduled, skipped };
        const all = [...legacy, ...due];
        const plans = await this.prisma.subscription_Types.findMany({
            where: { id: { in: Array.from(new Set(all.map((sub) => sub.idSubscriptionTypes))) } },
        });
        const clubs = await this.prisma.club.findMany({
            where: { id: { in: Array.from(new Set(plans.map((plan) => plan.idClub))) } },
        });
        const methodIds = Array.from(new Set(all.map((sub) => sub.idPaymentMethods).filter((id) => typeof id === 'number')));
        const methods = methodIds.length
            ? await this.prisma.payment_Methods.findMany({ where: { id: { in: methodIds } } })
            : [];
        const planById = new Map(plans.map((plan) => [plan.id, plan]));
        const clubById = new Map(clubs.map((club) => [club.id, club]));
        const methodById = new Map(methods.map((method) => [method.id, method]));
        const dueUserIds = Array.from(new Set(all.map((sub) => sub.idUser)));
        const dueClubIds = clubs.map((club) => club.id);
        const preferences = dueClubIds.length
            ? await this.prisma.user_Courier_Preference.findMany({
                where: { idUser: { in: dueUserIds }, idClub: { in: dueClubIds }, active: true },
            })
            : [];
        const clubCouriers = dueClubIds.length
            ? await this.prisma.club_Courier.findMany({ where: { idClub: { in: dueClubIds }, active: true } })
            : [];
        const courierIds = Array.from(new Set(clubCouriers.map((link) => link.idCourier)));
        const couriers = courierIds.length
            ? await this.prisma.courier.findMany({ where: { id: { in: courierIds }, active: true } })
            : [];
        const courierById = new Map(couriers.map((courier) => [courier.id, courier]));
        const shippingFeeFor = (idUser, idClub) => {
            const chosen = preferences.filter((pref) => pref.idUser === idUser && pref.idClub === idClub);
            for (const pref of chosen) {
                const link = clubCouriers.find((item) => item.idClub === idClub && item.idCourier === pref.idCourier);
                const courier = courierById.get(pref.idCourier);
                if (link && courier)
                    return (0, shipping_1.courierFee)(courier.isInternal, link.baseFee);
            }
            return 0;
        };
        for (const sub of legacy) {
            const plan = planById.get(sub.idSubscriptionTypes);
            const next = plan ? (0, billing_1.nextFutureDate)(sub.startDate, plan.frequency, now) : null;
            if (!next) {
                skipped += 1;
                continue;
            }
            const result = await this.prisma.user_Subscriptions.updateMany({
                where: { id: sub.id, nextPaymentDate: null },
                data: { nextPaymentDate: next },
            });
            if (result.count === 1)
                scheduled += 1;
        }
        for (const sub of due) {
            const plan = planById.get(sub.idSubscriptionTypes);
            const club = plan ? clubById.get(plan.idClub) : undefined;
            const dueDate = sub.nextPaymentDate;
            if (!plan || !club || !dueDate || club.clubStatus !== 'APROBADO') {
                skipped += 1;
                continue;
            }
            const next = (0, billing_1.nextFutureDate)(dueDate, plan.frequency, now);
            const method = sub.idPaymentMethods ? methodById.get(sub.idPaymentMethods) : undefined;
            const code = method ? (0, payments_constants_1.codeFromMethodName)(method.method) : null;
            const isCash = code === 'efectivo';
            const planAmount = (0, billing_1.priceFor)(plan, code);
            if (!next || !Number.isFinite(planAmount) || planAmount <= payments_constants_1.AURABOX_COMMISSION) {
                skipped += 1;
                continue;
            }
            const amount = planAmount + shippingFeeFor(sub.idUser, plan.idClub);
            const charged = await this.prisma.$transaction(async (tx) => {
                const claimed = await tx.user_Subscriptions.updateMany({
                    where: { id: sub.id, subscriptionStatus: 'Activa', nextPaymentDate: dueDate },
                    data: {
                        nextPaymentDate: next,
                        ...(isCash ? {} : { lastPaymentDate: now, monthlyAmountPaid: String(amount) }),
                    },
                });
                if (claimed.count !== 1)
                    return false;
                await tx.payment.create({
                    data: {
                        idUserSubscription: sub.id,
                        idUser: sub.idUser,
                        idClub: plan.idClub,
                        idPaymentMethods: sub.idPaymentMethods ?? undefined,
                        idGatewayTransaction: isCash ? null : `SIM-R-${now.getTime()}-${sub.id}`,
                        totalAmountPaid: String(amount),
                        clubAmount: String(amount - payments_constants_1.AURABOX_COMMISSION),
                        commissionAmount: String(payments_constants_1.AURABOX_COMMISSION),
                        paymentDate: now,
                        paymentStatus: (isCash ? 'Pendiente' : 'Exitoso'),
                    },
                });
                return true;
            });
            if (charged)
                renewed += 1;
            else
                skipped += 1;
        }
        return { renewed, scheduled, skipped };
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map