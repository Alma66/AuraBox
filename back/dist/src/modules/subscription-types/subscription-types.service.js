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
function sanitize(nt) {
    if (!nt)
        return nt;
    if (nt.basePrice !== undefined && nt.basePrice !== null) {
        try {
            nt.basePrice = nt.basePrice.toString();
        }
        catch { }
    }
    if (nt.cashDiscount !== undefined && nt.cashDiscount !== null) {
        try {
            nt.cashDiscount = nt.cashDiscount.toString();
        }
        catch { }
    }
    if (nt.transferDiscount !== undefined && nt.transferDiscount !== null) {
        try {
            nt.transferDiscount = nt.transferDiscount.toString();
        }
        catch { }
    }
    return nt;
}
let SubscriptionTypesService = class SubscriptionTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado (ID_Club inválido)');
        const data = {
            idClub: dto.idClub,
            name: dto.name,
            description: dto.description ?? null,
            basePrice: dto.basePrice,
            frequency: dto.frequency,
            cashDiscount: dto.cashDiscount ?? undefined,
            transferDiscount: dto.transferDiscount ?? undefined,
            active: dto.active ?? true,
        };
        try {
            const created = await this.prisma.subscription_Types.create({ data });
            return sanitize(created);
        }
        catch (err) {
            throw err;
        }
    }
    async findAll() {
        const rows = await this.prisma.subscription_Types.findMany({ orderBy: { id: 'desc' } });
        return rows.map((r) => sanitize(r));
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
        return rows.map((r) => sanitize(r));
    }
    async update(id, dto, userRole) {
        const existing = await this.prisma.subscription_Types.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        const data = {};
        if (dto.idClub !== undefined)
            data.idClub = dto.idClub;
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.basePrice !== undefined)
            data.basePrice = dto.basePrice;
        if (dto.frequency !== undefined)
            data.frequency = dto.frequency;
        if (dto.cashDiscount !== undefined)
            data.cashDiscount = dto.cashDiscount;
        if (dto.transferDiscount !== undefined)
            data.transferDiscount = dto.transferDiscount;
        if (dto.active !== undefined)
            data.active = dto.active;
        const updated = await this.prisma.subscription_Types.update({
            where: { id },
            data,
        });
        return sanitize(updated);
    }
    async remove(id) {
        const existing = await this.prisma.subscription_Types.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        await this.prisma.subscription_Types.delete({ where: { id } });
        return { ok: true };
    }
};
exports.SubscriptionTypesService = SubscriptionTypesService;
exports.SubscriptionTypesService = SubscriptionTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionTypesService);
//# sourceMappingURL=subscription-types.service.js.map