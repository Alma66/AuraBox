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
exports.BoxContentHistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(history) {
    if (!history)
        return history;
    if (history.productExpirationDate instanceof Date)
        history.productExpirationDate = history.productExpirationDate.toISOString();
    if (history.publicationDate instanceof Date)
        history.publicationDate = history.publicationDate.toISOString();
    return history;
}
let BoxContentHistoryService = class BoxContentHistoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
        if (!subType)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        const created = await this.prisma.boxContentHistory.create({
            data: {
                idSubscriptionTypes: dto.idSubscriptionTypes,
                deliveryMonthYear: dto.deliveryMonthYear,
                productName: dto.productName,
                productDescription: dto.productDescription,
                usageInstructions: dto.usageInstructions ?? null,
                productExpirationDate: dto.productExpirationDate ? new Date(dto.productExpirationDate) : null,
                productImageUrl: dto.productImageUrl ?? null,
                productVideoUrl: dto.productVideoUrl ?? null,
                additionalNotes: dto.additionalNotes ?? null,
                publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : null,
            },
        });
        return sanitize(created);
    }
    async findAll(page = 1, perPage = 50) {
        const skip = (page - 1) * perPage;
        const histories = await this.prisma.boxContentHistory.findMany({
            skip,
            take: perPage,
            orderBy: { publicationDate: 'desc' },
        });
        return histories.map(sanitize);
    }
    async findBySubscriptionType(idSubscriptionTypes) {
        const histories = await this.prisma.boxContentHistory.findMany({
            where: { idSubscriptionTypes },
            orderBy: { publicationDate: 'desc' },
        });
        return histories.map(sanitize);
    }
    async findByDeliveryMonth(deliveryMonthYear) {
        const histories = await this.prisma.boxContentHistory.findMany({
            where: { deliveryMonthYear },
            orderBy: { publicationDate: 'desc' },
        });
        return histories.map(sanitize);
    }
    async findOne(id) {
        const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Historial de caja no encontrado');
        return sanitize(item);
    }
    async update(id, dto) {
        const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Historial de caja no encontrado');
        const updated = await this.prisma.boxContentHistory.update({
            where: { id },
            data: {
                ...dto,
                productExpirationDate: dto.productExpirationDate ? new Date(dto.productExpirationDate) : item.productExpirationDate,
                publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : item.publicationDate,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Historial de caja no encontrado');
        await this.prisma.boxContentHistory.delete({ where: { id } });
        return { message: 'Registro de BoxContentHistory eliminado correctamente' };
    }
};
exports.BoxContentHistoryService = BoxContentHistoryService;
exports.BoxContentHistoryService = BoxContentHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BoxContentHistoryService);
//# sourceMappingURL=box-content-history.service.js.map