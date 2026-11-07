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
exports.ClubLegalContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const club_visibility_1 = require("../../common/utils/club-visibility");
let ClubLegalContentService = class ClubLegalContentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertOwnership(idClub, entrepreneurId) {
        const association = await this.prisma.entrepreneur_Club.findFirst({
            where: { idClub, idEntrepreneurs: entrepreneurId },
        });
        if (!association)
            throw new common_1.ForbiddenException('No tenés acceso a este club');
    }
    async findByClub(idClub, user) {
        await (0, club_visibility_1.assertClubVisible)(this.prisma, idClub, user);
        const content = await this.prisma.club_Legal_Content.findUnique({ where: { idClub } });
        if (!content) {
            return { idClub, termsAndConditions: [], privacyAndSecurityPolicy: [] };
        }
        return content;
    }
    async upsert(idClub, dto, entrepreneurId) {
        await this.assertOwnership(idClub, entrepreneurId);
        const club = await this.prisma.club.findUnique({ where: { id: idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        return this.prisma.club_Legal_Content.upsert({
            where: { idClub },
            create: {
                idClub,
                termsAndConditions: dto.termsAndConditions ?? [],
                privacyAndSecurityPolicy: dto.privacyAndSecurityPolicy ?? [],
            },
            update: {
                ...(dto.termsAndConditions !== undefined ? { termsAndConditions: dto.termsAndConditions } : {}),
                ...(dto.privacyAndSecurityPolicy !== undefined ? { privacyAndSecurityPolicy: dto.privacyAndSecurityPolicy } : {}),
            },
        });
    }
};
exports.ClubLegalContentService = ClubLegalContentService;
exports.ClubLegalContentService = ClubLegalContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClubLegalContentService);
//# sourceMappingURL=club-legal-content.service.js.map