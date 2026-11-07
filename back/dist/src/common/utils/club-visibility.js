"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canViewClub = canViewClub;
exports.assertClubVisible = assertClubVisible;
const common_1 = require("@nestjs/common");
async function canViewClub(prisma, idClub, user) {
    const club = await prisma.club.findUnique({ where: { id: idClub }, select: { clubStatus: true } });
    if (!club)
        return false;
    if (club.clubStatus === 'APROBADO')
        return true;
    if (!user)
        return false;
    if (user.role === 'admin')
        return true;
    if (user.role === 'entrepreneur') {
        const assoc = await prisma.entrepreneur_Club.findFirst({
            where: { idClub, idEntrepreneurs: user.id },
        });
        return !!assoc;
    }
    return false;
}
async function assertClubVisible(prisma, idClub, user) {
    const visible = await canViewClub(prisma, idClub, user);
    if (!visible)
        throw new common_1.NotFoundException('Club no encontrado');
}
//# sourceMappingURL=club-visibility.js.map