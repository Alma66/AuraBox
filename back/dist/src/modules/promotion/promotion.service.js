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
exports.PromotionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(promo) {
    if (!promo)
        return promo;
    if (promo.discountPercentage !== undefined && promo.discountPercentage !== null) {
        try {
            promo.discountPercentage = promo.discountPercentage.toString();
        }
        catch { }
    }
    if (promo.startDate instanceof Date)
        promo.startDate = promo.startDate.toISOString();
    if (promo.endDate instanceof Date)
        promo.endDate = promo.endDate.toISOString();
    if (promo.createdAt instanceof Date)
        promo.createdAt = promo.createdAt.toISOString();
    return promo;
}
let PromotionService = class PromotionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, createdBy) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const created = await this.prisma.promotion.create({
            data: {
                idClub: dto.idClub,
                name: dto.name,
                description: dto.description ?? null,
                promotionType: dto.promotionType,
                discountPercentage: dto.discountPercentage ?? null,
                idSubscriptionTypes: dto.idSubscriptionTypes ?? null,
                comboSubscriptionIds: dto.comboSubscriptionIds ?? null,
                minSubscriptionsQty: dto.minSubscriptionsQty ?? null,
                freeShipping: dto.freeShipping ?? false,
                couponCode: dto.couponCode ?? null,
                durationMonths: dto.durationMonths ?? null,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                active: dto.active ?? true,
                createdBy: createdBy ?? null,
            },
        });
        return sanitize(created);
    }
    async findByClub(idClub) {
        const promos = await this.prisma.promotion.findMany({
            where: { idClub },
            orderBy: { createdAt: 'desc' },
        });
        return promos.map(sanitize);
    }
    async findOne(id) {
        const promo = await this.prisma.promotion.findUnique({ where: { id } });
        if (!promo)
            throw new common_1.NotFoundException('Promoción no encontrada');
        return sanitize(promo);
    }
    async update(id, dto) {
        const existing = await this.prisma.promotion.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Promoción no encontrada');
        const updated = await this.prisma.promotion.update({
            where: { id },
            data: {
                ...dto,
                startDate: dto.startDate ? new Date(dto.startDate) : existing.startDate,
                endDate: dto.endDate ? new Date(dto.endDate) : existing.endDate,
            },
        });
        return sanitize(updated);
    }
    async toggleActive(id, active) {
        const existing = await this.prisma.promotion.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Promoción no encontrada');
        const updated = await this.prisma.promotion.update({ where: { id }, data: { active } });
        return sanitize(updated);
    }
    async remove(id) {
        const existing = await this.prisma.promotion.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Promoción no encontrada');
        await this.prisma.promotion.delete({ where: { id } });
        return { message: 'Promoción eliminada correctamente' };
    }
};
exports.PromotionService = PromotionService;
exports.PromotionService = PromotionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromotionService);
//# sourceMappingURL=promotion.service.js.map