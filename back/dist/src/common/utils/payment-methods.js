"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveAcceptedCodes = exports.getAcceptedCodes = exports.findOrCreateMethod = void 0;
const payments_constants_1 = require("../../modules/payments/payments.constants");
const findOrCreateMethod = async (prisma, code) => {
    const found = await prisma.payment_Methods.findFirst({
        where: { method: { contains: payments_constants_1.PAYMENT_METHOD_KEYWORDS[code], mode: 'insensitive' }, active: true },
        orderBy: { id: 'asc' },
    });
    if (found)
        return found;
    const name = payments_constants_1.PAYMENT_METHOD_DEFAULT_NAMES[code];
    return prisma.payment_Methods.upsert({
        where: { method: name },
        update: { active: true },
        create: { method: name, active: true },
    });
};
exports.findOrCreateMethod = findOrCreateMethod;
const getAcceptedCodes = async (prisma, clubId) => {
    const links = await prisma.club_Payment_Method.findMany({ where: { idClub: clubId } });
    if (links.length === 0)
        return [...payments_constants_1.PAYMENT_METHOD_CODES];
    const methods = await prisma.payment_Methods.findMany({
        where: { id: { in: links.map((link) => link.idPaymentMethod) }, active: true },
    });
    const codes = new Set();
    methods.forEach((method) => {
        const code = (0, payments_constants_1.codeFromMethodName)(method.method);
        if (code)
            codes.add(code);
    });
    if (codes.size === 0)
        return [...payments_constants_1.PAYMENT_METHOD_CODES];
    return payments_constants_1.PAYMENT_METHOD_CODES.filter((code) => codes.has(code));
};
exports.getAcceptedCodes = getAcceptedCodes;
const saveAcceptedCodes = async (prisma, clubId, codes) => {
    const ids = [];
    for (const code of codes) {
        const method = await (0, exports.findOrCreateMethod)(prisma, code);
        ids.push(method.id);
    }
    const links = await prisma.club_Payment_Method.findMany({ where: { idClub: clubId } });
    const methods = links.length > 0
        ? await prisma.payment_Methods.findMany({ where: { id: { in: links.map((link) => link.idPaymentMethod) } } })
        : [];
    const methodById = new Map(methods.map((method) => [method.id, method]));
    const managedLinkIds = links
        .filter((link) => {
        const method = methodById.get(link.idPaymentMethod);
        return method ? (0, payments_constants_1.codeFromMethodName)(method.method) !== null : false;
    })
        .map((link) => link.id);
    await prisma.$transaction([
        prisma.club_Payment_Method.deleteMany({ where: { id: { in: managedLinkIds } } }),
        prisma.club_Payment_Method.createMany({
            data: Array.from(new Set(ids)).map((id) => ({ idClub: clubId, idPaymentMethod: id })),
        }),
    ]);
};
exports.saveAcceptedCodes = saveAcceptedCodes;
//# sourceMappingURL=payment-methods.js.map