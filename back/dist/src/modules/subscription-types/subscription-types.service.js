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
exports.SubscriptionTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
function sanitize(nt) {
    if (!nt)
        return nt;
    for (const field of ['basePrice', 'cashDiscount', 'transferDiscount']) {
        if (nt[field] !== undefined && nt[field] !== null) {
            try {
                nt[field] = nt[field].toString();
            }
            catch { }
        }
    }
    if (nt.includes && typeof nt.includes === 'string') {
        try {
            nt.includes = JSON.parse(nt.includes);
        }
        catch {
            nt.includes = [];
        }
    }
    return nt;
}
let SubscriptionTypesService = class SubscriptionTypesService {
    prisma;
    cloudinary;
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
    }
    async assertEntrepreneurOwnsClub(entrepreneurId, clubId) {
        const assoc = await this.prisma.entrepreneur_Club.findFirst({
            where: { idEntrepreneurs: entrepreneurId, idClub: clubId },
        });
        if (!assoc)
            throw new common_1.ForbiddenException('No sos owner de este club');
    }
    async create(dto, requesterId, requesterRole) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        if (requesterRole === 'entrepreneur' && requesterId) {
            await this.assertEntrepreneurOwnsClub(requesterId, dto.idClub);
        }
        const includesStr = Array.isArray(dto.includes)
            ? JSON.stringify(dto.includes)
            : (dto.includes ?? null);
        const data = {
            idClub: dto.idClub,
            name: dto.name,
            description: dto.description ?? null,
            basePrice: (dto.basePrice ?? dto.price),
            frequency: dto.frequency,
            cashDiscount: dto.cashDiscount ?? undefined,
            transferDiscount: dto.transferDiscount ?? undefined,
            active: dto.active ?? true,
            shippingAreas: dto.shippingAreas ?? null,
            includes: includesStr,
            imageUrl: dto.imageUrl ?? null,
        };
        const created = await this.prisma.subscription_Types.create({ data });
        return sanitize(created);
    }
    async findAll() {
        const rows = await this.prisma.subscription_Types.findMany({ orderBy: { id: 'desc' } });
        return rows.map(sanitize);
    }
    async findById(id) {
        const row = await this.prisma.subscription_Types.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        return sanitize(row);
    }
    async findByClub(idClub) {
        const rows = await this.prisma.subscription_Types.findMany({
            where: { idClub },
            orderBy: { id: 'desc' },
        });
        return rows.map(sanitize);
    }
    async update(id, dto, requesterId, requesterRole) {
        const existing = await this.prisma.subscription_Types.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        if (requesterRole === 'entrepreneur' && requesterId) {
            await this.assertEntrepreneurOwnsClub(requesterId, existing.idClub);
        }
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.basePrice !== undefined || dto.price !== undefined) {
            data.basePrice = (dto.basePrice ?? dto.price);
        }
        if (dto.frequency !== undefined)
            data.frequency = dto.frequency;
        if (dto.cashDiscount !== undefined)
            data.cashDiscount = dto.cashDiscount;
        if (dto.transferDiscount !== undefined)
            data.transferDiscount = dto.transferDiscount;
        if (dto.active !== undefined)
            data.active = dto.active;
        if (dto.shippingAreas !== undefined)
            data.shippingAreas = dto.shippingAreas;
        if (dto.includes !== undefined) {
            data.includes = Array.isArray(dto.includes)
                ? JSON.stringify(dto.includes)
                : dto.includes;
        }
        if (dto.imageUrl !== undefined)
            data.imageUrl = dto.imageUrl;
        const updated = await this.prisma.subscription_Types.update({ where: { id }, data });
        return sanitize(updated);
    }
    async updateImage(id, imageFile, requesterId, requesterRole) {
        if (!imageFile)
            throw new common_1.BadRequestException('Se requiere una imagen');
        const existing = await this.prisma.subscription_Types.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        if (requesterRole === 'entrepreneur' && requesterId) {
            await this.assertEntrepreneurOwnsClub(requesterId, existing.idClub);
        }
        if (existing.imageUrl) {
            try {
                const publicId = this.cloudinary.extractPublicId(existing.imageUrl);
                await this.cloudinary.deleteImage(publicId);
            }
            catch { }
        }
        const imageUrl = await this.cloudinary.uploadImage(imageFile, 'aurabox/plans/images');
        const updated = await this.prisma.subscription_Types.update({
            where: { id },
            data: { imageUrl },
        });
        return { imageUrl: updated.imageUrl };
    }
    async remove(id, requesterId, requesterRole) {
        const existing = await this.prisma.subscription_Types.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        if (requesterRole === 'entrepreneur' && requesterId) {
            await this.assertEntrepreneurOwnsClub(requesterId, existing.idClub);
        }
        await this.prisma.subscription_Types.delete({ where: { id } });
        return { ok: true };
    }
};
exports.SubscriptionTypesService = SubscriptionTypesService;
exports.SubscriptionTypesService = SubscriptionTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], SubscriptionTypesService);
//# sourceMappingURL=subscription-types.service.js.map