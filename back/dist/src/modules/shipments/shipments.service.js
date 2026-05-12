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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(shipment) {
    if (!shipment)
        return shipment;
    if (shipment.shippingCost !== undefined && shipment.shippingCost !== null) {
        try {
            shipment.shippingCost = shipment.shippingCost.toString();
        }
        catch { }
    }
    ['estimatedDeliveryStartDate', 'estimatedDeliveryEndDate', 'actualDeliveryDate'].forEach((k) => {
        if (shipment[k] instanceof Date)
            shipment[k] = shipment[k].toISOString();
    });
    return shipment;
}
let ShipmentsService = class ShipmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: dto.idUserSubscriptions } });
        if (!sub)
            throw new common_1.NotFoundException('Suscripción no encontrada');
        if (dto.idClub) {
            const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
            if (!club)
                throw new common_1.NotFoundException('Club no encontrado');
        }
        const created = await this.prisma.shipments.create({
            data: {
                idUser: dto.idUser,
                idUserSubscriptions: dto.idUserSubscriptions,
                idClub: dto.idClub,
                boxMonthYear: dto.boxMonthYear,
                estimatedDeliveryStartDate: dto.estimatedDeliveryStartDate ? new Date(dto.estimatedDeliveryStartDate) : undefined,
                estimatedDeliveryEndDate: dto.estimatedDeliveryEndDate ? new Date(dto.estimatedDeliveryEndDate) : undefined,
                actualDeliveryDate: dto.actualDeliveryDate ? new Date(dto.actualDeliveryDate) : undefined,
                shipmentStatus: dto.shipmentStatus,
                trackingNumber: dto.trackingNumber,
                logisticsCompany: dto.logisticsCompany,
                shippingCost: dto.shippingCost,
                shippingNotes: dto.shippingNotes,
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const shipments = await this.prisma.shipments.findMany({
            orderBy: { estimatedDeliveryStartDate: 'desc' },
        });
        return shipments.map(sanitize);
    }
    async findOne(id) {
        const shipment = await this.prisma.shipments.findUnique({ where: { id } });
        if (!shipment)
            throw new common_1.NotFoundException('Envío no encontrado');
        return sanitize(shipment);
    }
    async findByUser(idUser) {
        const shipments = await this.prisma.shipments.findMany({
            where: { idUser },
            orderBy: { estimatedDeliveryStartDate: 'desc' },
        });
        return shipments.map(sanitize);
    }
    async findByClub(idClub) {
        const shipments = await this.prisma.shipments.findMany({
            where: { idClub },
            orderBy: { estimatedDeliveryStartDate: 'desc' },
        });
        return shipments.map(sanitize);
    }
    async update(id, dto) {
        const shipment = await this.prisma.shipments.findUnique({ where: { id } });
        if (!shipment)
            throw new common_1.NotFoundException('Envío no encontrado');
        const updated = await this.prisma.shipments.update({
            where: { id },
            data: {
                ...dto,
                estimatedDeliveryStartDate: dto.estimatedDeliveryStartDate ? new Date(dto.estimatedDeliveryStartDate) : shipment.estimatedDeliveryStartDate,
                estimatedDeliveryEndDate: dto.estimatedDeliveryEndDate ? new Date(dto.estimatedDeliveryEndDate) : shipment.estimatedDeliveryEndDate,
                actualDeliveryDate: dto.actualDeliveryDate ? new Date(dto.actualDeliveryDate) : shipment.actualDeliveryDate,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const shipment = await this.prisma.shipments.findUnique({ where: { id } });
        if (!shipment)
            throw new common_1.NotFoundException('Envío no encontrado');
        await this.prisma.shipments.delete({ where: { id } });
        return { message: 'Envío eliminado correctamente' };
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map