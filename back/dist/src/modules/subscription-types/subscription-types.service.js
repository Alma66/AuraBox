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
const payments_constants_1 = require("../payments/payments.constants");
const billing_1 = require("../../common/utils/billing");
function sanitize(nt) {
    if (!nt)
        return nt;
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
    if (nt.createdAt instanceof Date) {
        nt.createdAt = nt.createdAt.toISOString();
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
    assertPricing(price, cash, transfer) {
        const base = Number(price);
        if (!Number.isFinite(base) || base <= payments_constants_1.AURABOX_COMMISSION) {
            throw new common_1.BadRequestException(`El precio debe ser mayor a $${payments_constants_1.AURABOX_COMMISSION}`);
        }
        for (const discount of [cash, transfer]) {
            if (discount === undefined || discount === null)
                continue;
            const value = Number(discount);
            if (!Number.isFinite(value) || value < 0 || value > 90) {
                throw new common_1.BadRequestException('Los descuentos deben estar entre 0 y 90%');
            }
        }
        if ((0, billing_1.priceFor)(base, transfer, true) <= payments_constants_1.AURABOX_COMMISSION) {
            throw new common_1.BadRequestException('Con el descuento por transferencia el precio queda por debajo del mínimo');
        }
    }
    async deleteAsset(imageUrl) {
        if (!imageUrl)
            return;
        const publicId = this.cloudinary.extractPublicId(imageUrl);
        if (!publicId)
            return;
        try {
            await this.cloudinary.deleteImage(publicId);
        }
        catch { }
    }
    async create(dto, requesterId, requesterRole) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        if (requesterRole === 'entrepreneur' && requesterId) {
            await this.assertEntrepreneurOwnsClub(requesterId, dto.idClub);
        }
        this.assertPricing(dto.basePrice ?? dto.price, dto.cashDiscount, dto.transferDiscount);
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
    async canSeeAllPlans(idClub, user) {
        if (!user)
            return false;
        if (user.role === 'admin')
            return true;
        if (user.role !== 'entrepreneur')
            return false;
        const assoc = await this.prisma.entrepreneur_Club.findFirst({
            where: { idEntrepreneurs: user.id, idClub },
        });
        return !!assoc;
    }
    async findByIdForRequester(id, user) {
        const plan = await this.prisma.subscription_Types.findUnique({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        if (await this.canSeeAllPlans(plan.idClub, user))
            return sanitize(plan);
        if (user?.role === 'customer') {
            const subscription = await this.prisma.user_Subscriptions.findFirst({
                where: { idUser: user.id, idSubscriptionTypes: id },
            });
            if (subscription)
                return sanitize(plan);
        }
        const club = await this.prisma.club.findUnique({ where: { id: plan.idClub } });
        if (!plan.active || !club || club.clubStatus !== 'APROBADO') {
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        }
        return sanitize(plan);
    }
    async findByClubForRequester(idClub, user) {
        if (!Number.isInteger(idClub))
            return [];
        if (await this.canSeeAllPlans(idClub, user))
            return this.findByClub(idClub);
        const club = await this.prisma.club.findUnique({ where: { id: idClub } });
        if (!club || club.clubStatus !== 'APROBADO')
            return [];
        const rows = await this.prisma.subscription_Types.findMany({
            where: { idClub, active: true },
            orderBy: { id: 'desc' },
        });
        return rows.map(sanitize);
    }
    async findAllForRequester(user) {
        if (user?.role === 'admin')
            return this.findAll();
        const clubs = await this.prisma.club.findMany({
            where: { clubStatus: 'APROBADO' },
            select: { id: true },
        });
        const rows = await this.prisma.subscription_Types.findMany({
            where: { active: true, idClub: { in: clubs.map((club) => club.id) } },
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
        const newPrice = dto.basePrice ?? dto.price;
        if (newPrice !== undefined || dto.cashDiscount !== undefined || dto.transferDiscount !== undefined) {
            this.assertPricing(newPrice ?? existing.basePrice, dto.cashDiscount ?? existing.cashDiscount, dto.transferDiscount ?? existing.transferDiscount);
        }
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (newPrice !== undefined)
            data.basePrice = newPrice;
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
        const imageUrl = await this.cloudinary.uploadImage(imageFile, 'aurabox/plans/images');
        const updated = await this.prisma.subscription_Types.update({
            where: { id },
            data: { imageUrl },
        });
        if (existing.imageUrl && existing.imageUrl !== imageUrl) {
            await this.deleteAsset(existing.imageUrl);
        }
        return { imageUrl: updated.imageUrl };
    }
    async remove(id, requesterId, requesterRole) {
        const existing = await this.prisma.subscription_Types.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        if (requesterRole === 'entrepreneur' && requesterId) {
            await this.assertEntrepreneurOwnsClub(requesterId, existing.idClub);
        }
        const subscriptions = await this.prisma.user_Subscriptions.count({ where: { idSubscriptionTypes: id } });
        if (subscriptions > 0) {
            throw new common_1.BadRequestException('Este plan ya tiene suscripciones registradas. Desactivalo en lugar de eliminarlo.');
        }
        await this.prisma.$transaction([
            this.prisma.cart_Item.deleteMany({ where: { idSubscriptionTypes: id } }),
            this.prisma.favorites.deleteMany({ where: { idSubscriptionTypes: id } }),
            this.prisma.boxContentHistory.deleteMany({ where: { idSubscriptionTypes: id } }),
            this.prisma.subscription_Types.delete({ where: { id } }),
        ]);
        await this.deleteAsset(existing.imageUrl);
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