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
exports.CourierService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitizeFee(item) {
    if (!item)
        return item;
    if (item.baseFee !== undefined && item.baseFee !== null) {
        try {
            item.baseFee = item.baseFee.toString();
        }
        catch { }
    }
    return item;
}
let CourierService = class CourierService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const exists = await this.prisma.courier.findUnique({ where: { code: dto.code } });
        if (exists)
            throw new common_1.ConflictException('Ya existe un courier con ese código');
        return this.prisma.courier.create({
            data: {
                code: dto.code,
                name: dto.name,
                isInternal: dto.isInternal ?? false,
                active: dto.active ?? true,
            },
        });
    }
    async findAll() {
        return this.prisma.courier.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
    }
    async findByClub(idClub) {
        const clubCouriers = await this.prisma.club_Courier.findMany({
            where: { idClub, active: true },
        });
        const courierIds = clubCouriers.map((c) => c.idCourier);
        if (courierIds.length === 0)
            return [];
        const couriers = await this.prisma.courier.findMany({
            where: { id: { in: courierIds }, active: true },
            orderBy: { name: 'asc' },
        });
        const feeByCourierId = new Map(clubCouriers.map((c) => [c.idCourier, c.baseFee]));
        return couriers.map((c) => sanitizeFee({ ...c, baseFee: feeByCourierId.get(c.id) ?? null }));
    }
    async setClubCouriers(idClub, dto) {
        const club = await this.prisma.club.findUnique({ where: { id: idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const validCouriers = await this.prisma.courier.findMany({
            where: { id: { in: dto.courierIds }, active: true },
        });
        if (validCouriers.length !== dto.courierIds.length) {
            throw new common_1.NotFoundException('Uno o más couriers no existen');
        }
        const existing = await this.prisma.club_Courier.findMany({ where: { idClub } });
        const existingByCourierId = new Map(existing.map((e) => [e.idCourier, e]));
        const operations = dto.courierIds.map((idCourier) => {
            const current = existingByCourierId.get(idCourier);
            if (current) {
                return this.prisma.club_Courier.update({ where: { id: current.id }, data: { active: true } });
            }
            return this.prisma.club_Courier.create({ data: { idClub, idCourier, active: true } });
        });
        const toDeactivate = existing.filter((e) => !dto.courierIds.includes(e.idCourier) && e.active);
        const deactivateOperations = toDeactivate.map((e) => this.prisma.club_Courier.update({ where: { id: e.id }, data: { active: false } }));
        await this.prisma.$transaction([...operations, ...deactivateOperations]);
        return this.findByClub(idClub);
    }
    async setCourierFee(idClub, idCourier, dto) {
        const link = await this.prisma.club_Courier.findUnique({
            where: { idClub_idCourier: { idClub, idCourier } },
        });
        if (!link)
            throw new common_1.NotFoundException('Este courier no está habilitado para este club');
        const updated = await this.prisma.club_Courier.update({
            where: { id: link.id },
            data: { baseFee: dto.baseFee },
        });
        return sanitizeFee(updated);
    }
};
exports.CourierService = CourierService;
exports.CourierService = CourierService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CourierService);
//# sourceMappingURL=courier.service.js.map