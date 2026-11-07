"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeFromMethodName = exports.PAYMENT_METHOD_DEFAULT_NAMES = exports.PAYMENT_METHOD_KEYWORDS = exports.PAYMENT_METHOD_CODES = exports.AUTO_CONFIRM_TRANSFERS = exports.AURABOX_COMMISSION = void 0;
exports.AURABOX_COMMISSION = 200;
exports.AUTO_CONFIRM_TRANSFERS = true;
exports.PAYMENT_METHOD_CODES = ['mercadopago', 'tarjeta', 'transferencia', 'efectivo'];
exports.PAYMENT_METHOD_KEYWORDS = {
    mercadopago: 'mercado',
    tarjeta: 'tarjeta',
    transferencia: 'transfer',
    efectivo: 'efectivo',
};
exports.PAYMENT_METHOD_DEFAULT_NAMES = {
    mercadopago: 'Mercado Pago',
    tarjeta: 'Tarjeta de crédito/débito',
    transferencia: 'Transferencia bancaria',
    efectivo: 'Efectivo contra entrega',
};
const codeFromMethodName = (name) => {
    const lower = name.toLowerCase();
    const found = exports.PAYMENT_METHOD_CODES.find((code) => lower.includes(exports.PAYMENT_METHOD_KEYWORDS[code]));
    return found ?? null;
};
exports.codeFromMethodName = codeFromMethodName;
//# sourceMappingURL=payments.constants.js.map