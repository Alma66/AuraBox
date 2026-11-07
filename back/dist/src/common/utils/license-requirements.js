"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUIREMENT_STATE_LABELS = exports.EXPIRING_SOON_DAYS = void 0;
exports.summarizeRequirements = summarizeRequirements;
exports.getLicenseRequirements = getLicenseRequirements;
exports.EXPIRING_SOON_DAYS = 30;
exports.REQUIREMENT_STATE_LABELS = {
    FALTANTE: 'sin presentar',
    PENDIENTE: 'en revisión',
    APROBADA: 'aprobada',
    RECHAZADA: 'rechazada',
    VENCIDA: 'vencida',
};
const DAY_MS = 24 * 60 * 60 * 1000;
function summarizeRequirements(items) {
    const count = (state) => items.filter((item) => item.state === state).length;
    return {
        required: items.length,
        approved: count('APROBADA'),
        pending: count('PENDIENTE'),
        rejected: count('RECHAZADA'),
        missing: count('FALTANTE'),
        expired: count('VENCIDA'),
        expiringSoon: items.filter((item) => item.expiringSoon).length,
        allValid: items.every((item) => item.valid),
    };
}
async function getLicenseRequirements(prisma, idClub) {
    const owner = await prisma.entrepreneur_Club.findFirst({
        where: { idClub },
        orderBy: { associationDate: 'asc' },
    });
    const clubCategories = await prisma.club_Categories.findMany({ where: { idClub } });
    const categoryIds = clubCategories.map((row) => row.idCategories);
    const links = categoryIds.length > 0
        ? await prisma.category_License_Type.findMany({ where: { idCategories: { in: categoryIds } } })
        : [];
    const typeIds = Array.from(new Set(links.map((link) => link.idLicenseTypes)));
    const types = typeIds.length > 0
        ? await prisma.license_Types.findMany({ where: { id: { in: typeIds } }, orderBy: { name: 'asc' } })
        : [];
    const uploaded = owner && typeIds.length > 0
        ? await prisma.entrepreneur_Licenses.findMany({
            where: { idEntrepreneurs: owner.idEntrepreneurs, idLicenseTypes: { in: typeIds } },
        })
        : [];
    const now = new Date();
    const items = types.map((type) => {
        const license = uploaded.find((row) => row.idLicenseTypes === type.id);
        let state = 'FALTANTE';
        let daysToExpire = null;
        if (license) {
            const expired = !!license.expirationDate && license.expirationDate.getTime() < now.getTime();
            if (license.expirationDate) {
                daysToExpire = Math.ceil((license.expirationDate.getTime() - now.getTime()) / DAY_MS);
            }
            if (license.verificationStatus === 'PENDIENTE')
                state = 'PENDIENTE';
            else if (license.verificationStatus === 'RECHAZADO')
                state = 'RECHAZADA';
            else
                state = expired ? 'VENCIDA' : 'APROBADA';
        }
        return {
            idLicenseTypes: type.id,
            name: type.name,
            description: type.description,
            entrepreneurLicenseId: license?.id ?? null,
            verificationStatus: license?.verificationStatus ?? null,
            state,
            documentUrl: license?.documentUrl ?? null,
            issueDate: license?.issueDate ? license.issueDate.toISOString() : null,
            expirationDate: license?.expirationDate ? license.expirationDate.toISOString() : null,
            verificationNotes: license?.verificationNotes ?? null,
            verificationDate: license?.verificationDate ? license.verificationDate.toISOString() : null,
            daysToExpire,
            expiringSoon: state === 'APROBADA' && daysToExpire !== null && daysToExpire <= exports.EXPIRING_SOON_DAYS,
            valid: state === 'APROBADA',
        };
    });
    return { idEntrepreneur: owner?.idEntrepreneurs ?? null, items };
}
//# sourceMappingURL=license-requirements.js.map