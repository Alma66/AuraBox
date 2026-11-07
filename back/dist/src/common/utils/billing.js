"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceFor = exports.nextFutureDate = exports.nextPaymentFrom = exports.addMonths = void 0;
const FREQUENCY_MONTHS = {
    Mensual: 1,
    Bimestral: 2,
    Trimestral: 3,
    Cuatrimestral: 4,
    Quinquemestral: 5,
    Semestral: 6,
    Anual: 12,
};
const addMonths = (from, months) => {
    const result = new Date(from);
    const day = result.getDate();
    result.setDate(1);
    result.setMonth(result.getMonth() + months);
    const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(day, lastDay));
    return result;
};
exports.addMonths = addMonths;
const nextPaymentFrom = (from, frequency) => {
    const months = FREQUENCY_MONTHS[frequency];
    return months ? (0, exports.addMonths)(from, months) : null;
};
exports.nextPaymentFrom = nextPaymentFrom;
const nextFutureDate = (from, frequency, now) => {
    const months = FREQUENCY_MONTHS[frequency];
    if (!months)
        return null;
    for (let step = 1; step <= 600; step += 1) {
        const candidate = (0, exports.addMonths)(from, months * step);
        if (candidate.getTime() > now.getTime())
            return candidate;
    }
    return null;
};
exports.nextFutureDate = nextFutureDate;
const priceFor = (plan, code) => {
    const base = Number(plan.basePrice);
    const rawDiscount = code === 'transferencia' ? plan.transferDiscount : code === 'efectivo' ? plan.cashDiscount : 0;
    const discount = Number(rawDiscount ?? 0);
    return Math.round(base * (1 - discount / 100) * 100) / 100;
};
exports.priceFor = priceFor;
//# sourceMappingURL=billing.js.map