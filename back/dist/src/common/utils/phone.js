"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalizePhone = exports.normalizePhone = exports.PHONE_MESSAGE = exports.PHONE_REGEX = void 0;
const class_transformer_1 = require("class-transformer");
exports.PHONE_REGEX = /^\d{8,15}$/;
exports.PHONE_MESSAGE = 'El teléfono debe tener entre 8 y 15 dígitos';
const normalizePhone = (value) => {
    if (value === undefined)
        return undefined;
    if (value === null)
        return null;
    const digits = String(value).replace(/\D/g, '');
    return digits === '' ? null : digits;
};
exports.normalizePhone = normalizePhone;
const NormalizePhone = () => (0, class_transformer_1.Transform)(({ value }) => (0, exports.normalizePhone)(value));
exports.NormalizePhone = NormalizePhone;
//# sourceMappingURL=phone.js.map