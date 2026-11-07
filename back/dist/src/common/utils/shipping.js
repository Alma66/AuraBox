"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courierFee = courierFee;
function courierFee(isInternal, baseFee) {
    if (isInternal || baseFee === null || baseFee === undefined)
        return 0;
    const value = Number(baseFee);
    return Number.isFinite(value) && value > 0 ? value : 0;
}
//# sourceMappingURL=shipping.js.map