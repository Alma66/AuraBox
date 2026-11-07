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
exports.ClubBillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const payment_methods_1 = require("../../common/utils/payment-methods");
let ClubBillingService = class ClubBillingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertAccess(clubId, user) {
        const club = await this.prisma.club.findUnique({ where: { id: clubId } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        if (user.role === 'admin')
            return club;
        const link = await this.prisma.entrepreneur_Club.findFirst({
            where: { idClub: clubId, idEntrepreneurs: user.id },
        });
        if (!link)
            throw new common_1.ForbiddenException('No tenés acceso a este club');
        return club;
    }
    async get(clubId, user) {
        const club = await this.assertAccess(clubId, user);
        const methods = await (0, payment_methods_1.getAcceptedCodes)(this.prisma, clubId);
        return {
            bankHolder: club.bankHolder,
            bankCbu: club.bankCbu,
            bankAlias: club.bankAlias,
            methods,
        };
    }
    async update(clubId, dto, user) {
        await this.assertAccess(clubId, user);
        const methods = Array.from(new Set(dto.methods));
        if (methods.includes('transferencia') && (!dto.bankHolder || (!dto.bankCbu && !dto.bankAlias))) {
            throw new common_1.BadRequestException('Para aceptar transferencias cargá el titular y el CBU o el alias');
        }
        await this.prisma.club.update({
            where: { id: clubId },
            data: {
                bankHolder: dto.bankHolder ?? null,
                bankCbu: dto.bankCbu ?? null,
                bankAlias: dto.bankAlias ?? null,
            },
        });
        await (0, payment_methods_1.saveAcceptedCodes)(this.prisma, clubId, methods);
        return this.get(clubId, user);
    }
};
exports.ClubBillingService = ClubBillingService;
exports.ClubBillingService = ClubBillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClubBillingService);
//# sourceMappingURL=club-billing.service.js.map