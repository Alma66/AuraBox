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
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
function sanitize(history) {
    if (!history)
        return history;
    if (history.productExpirationDate instanceof Date)
        history.productExpirationDate = history.productExpirationDate.toISOString();
    if (history.publicationDate instanceof Date)
        history.publicationDate = history.publicationDate.toISOString();
    if (history.updatedAt instanceof Date)
        history.updatedAt = history.updatedAt.toISOString();
    return history;
}
let BoxContentHistoryService = class BoxContentHistoryService {
    prisma;
    cloudinary;
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
    }
    async assertOwnership(idSubscriptionTypes, requesterId, requesterRole) {
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
        if (!subType)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        if (requesterRole === 'admin')
            return subType;
        if (requesterRole !== 'entrepreneur' || !requesterId) {
            throw new common_1.ForbiddenException('No tenés acceso a esta suscripción');
        }
        const assoc = await this.prisma.entrepreneur_Club.findFirst({
            where: { idEntrepreneurs: requesterId, idClub: subType.idClub },
        });
        if (!assoc)
            throw new common_1.ForbiddenException('No tenés acceso a esta suscripción');
        return subType;
    }
    async assertCustomerAccess(idSubscriptionTypes, idUser) {
        const sub = await this.prisma.user_Subscriptions.findFirst({
            where: {
                idUser,
                idSubscriptionTypes,
                subscriptionStatus: { not: 'Pendiente_Pago' },
            },
        });
        if (!sub)
            throw new common_1.ForbiddenException('Solo podés ver el contenido de las cajas a las que estás suscripto');
    }
    async assertReadAccess(idSubscriptionTypes, user) {
        if (user.role === 'customer') {
            const subType = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
            if (!subType)
                throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
            await this.assertCustomerAccess(idSubscriptionTypes, user.id);
            return { onlyPublished: true };
        }
        await this.assertOwnership(idSubscriptionTypes, user.id, user.role);
        return { onlyPublished: false };
    }
    async create(dto, imageFile, requesterId, requesterRole) {
        await this.assertOwnership(dto.idSubscriptionTypes, requesterId, requesterRole);
        let productImageUrl = dto.productImageUrl ?? null;
        if (imageFile) {
            productImageUrl = await this.cloudinary.uploadImage(imageFile, 'aurabox/boxes');
        }
        const created = await this.prisma.boxContentHistory.create({
            data: {
                idSubscriptionTypes: dto.idSubscriptionTypes,
                deliveryMonthYear: dto.deliveryMonthYear,
                productName: dto.productName,
                productDescription: dto.productDescription,
                usageInstructions: dto.usageInstructions ?? null,
                productExpirationDate: dto.productExpirationDate ? new Date(dto.productExpirationDate) : null,
                productImageUrl,
                productVideoUrl: dto.productVideoUrl ?? null,
                additionalNotes: dto.additionalNotes ?? null,
                publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : new Date(),
                ageRestriction: dto.ageRestriction ?? false,
                originLocation: dto.originLocation ?? null,
                containsAllergens: dto.containsAllergens ?? false,
                allergensDetail: dto.allergensDetail ?? null,
                isDangerousItem: dto.isDangerousItem ?? false,
                dangerDetail: dto.dangerDetail ?? null,
                requiresCleaning: dto.requiresCleaning ?? false,
                cleaningInstructions: dto.cleaningInstructions ?? null,
            },
        });
        return sanitize(created);
    }
    async findAll(page = 1, perPage = 50) {
        const safePage = Number.isFinite(page) && page > 0 ? page : 1;
        const safePerPage = Number.isFinite(perPage) && perPage > 0 ? Math.min(perPage, 100) : 50;
        const histories = await this.prisma.boxContentHistory.findMany({
            skip: (safePage - 1) * safePerPage,
            take: safePerPage,
            orderBy: { publicationDate: 'desc' },
        });
        return histories.map(sanitize);
    }
    async findBySubscriptionType(idSubscriptionTypes, user) {
        const { onlyPublished } = await this.assertReadAccess(idSubscriptionTypes, user);
        const histories = await this.prisma.boxContentHistory.findMany({
            where: {
                idSubscriptionTypes,
                ...(onlyPublished
                    ? { OR: [{ publicationDate: null }, { publicationDate: { lte: new Date() } }] }
                    : {}),
            },
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
    async findOne(id, user) {
        const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Historial de caja no encontrado');
        const { onlyPublished } = await this.assertReadAccess(item.idSubscriptionTypes, user);
        if (onlyPublished && item.publicationDate && item.publicationDate > new Date()) {
            throw new common_1.NotFoundException('Historial de caja no encontrado');
        }
        return sanitize(item);
    }
    async update(id, dto, requesterId, requesterRole) {
        const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Historial de caja no encontrado');
        await this.assertOwnership(item.idSubscriptionTypes, requesterId, requesterRole);
        const { idSubscriptionTypes: _ignored, ...safeDto } = dto;
        const updated = await this.prisma.boxContentHistory.update({
            where: { id },
            data: {
                ...safeDto,
                productExpirationDate: dto.productExpirationDate ? new Date(dto.productExpirationDate) : item.productExpirationDate,
                publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : item.publicationDate,
            },
        });
        return sanitize(updated);
    }
    async remove(id, requesterId, requesterRole) {
        const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Historial de caja no encontrado');
        await this.assertOwnership(item.idSubscriptionTypes, requesterId, requesterRole);
        if (item.productImageUrl) {
            const publicId = this.cloudinary.extractPublicId(item.productImageUrl);
            await this.cloudinary.deleteImage(publicId);
        }
        await this.prisma.boxContentHistory.delete({ where: { id } });
        return { message: 'Registro de BoxContentHistory eliminado correctamente' };
    }
};
exports.BoxContentHistoryService = BoxContentHistoryService;
exports.BoxContentHistoryService = BoxContentHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], BoxContentHistoryService);
//# sourceMappingURL=box-content-history.service.js.map