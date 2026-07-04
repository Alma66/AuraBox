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
exports.RiderProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(profile) {
    if (!profile)
        return profile;
    if (profile.createdAt instanceof Date)
        profile.createdAt = profile.createdAt.toISOString();
    if (profile.costPerKm !== undefined && profile.costPerKm !== null) {
        try {
            profile.costPerKm = profile.costPerKm.toString();
        }
        catch { }
    }
    return profile;
}
let RiderProfileService = class RiderProfileService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.idEntrepreneur } });
        if (!entrepreneur)
            throw new common_1.NotFoundException('Emprendedor no encontrado');
        const exists = await this.prisma.rider_Profile.findUnique({ where: { idEntrepreneur: dto.idEntrepreneur } });
        if (exists)
            throw new common_1.ConflictException('Este emprendedor ya tiene un perfil de rider');
        const created = await this.prisma.rider_Profile.create({
            data: {
                idEntrepreneur: dto.idEntrepreneur,
                vehicleType: dto.vehicleType,
                licensePlate: dto.licensePlate,
                availability: dto.availability ?? true,
                zonesCovered: dto.zonesCovered,
                isActive: dto.isActive ?? true,
                costPerKm: dto.costPerKm ?? null,
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const profiles = await this.prisma.rider_Profile.findMany({ orderBy: { createdAt: 'desc' } });
        return profiles.map(sanitize);
    }
    async findOne(id) {
        const profile = await this.prisma.rider_Profile.findUnique({ where: { id } });
        if (!profile)
            throw new common_1.NotFoundException('Perfil de rider no encontrado');
        return sanitize(profile);
    }
    async findByEntrepreneur(idEntrepreneur) {
        const profile = await this.prisma.rider_Profile.findUnique({ where: { idEntrepreneur } });
        return profile ? sanitize(profile) : null;
    }
    async findByClub(idClub) {
        const role = await this.prisma.role.findUnique({ where: { code: 'DELIVERY_RIDER' } });
        if (!role)
            return [];
        const associations = await this.prisma.entrepreneur_Club.findMany({ where: { idClub } });
        const entrepreneurIds = associations.map((a) => a.idEntrepreneurs);
        if (entrepreneurIds.length === 0)
            return [];
        const roleAssignments = await this.prisma.adminOrEntrepreneurRole.findMany({
            where: { idRole: role.id, assignedToType: 'Entrepreneur', assignedTo: { in: entrepreneurIds } },
        });
        const riderIds = Array.from(new Set(roleAssignments.map((r) => r.assignedTo)));
        if (riderIds.length === 0)
            return [];
        const entrepreneurs = await this.prisma.entrepreneurs.findMany({
            where: { id: { in: riderIds } },
            select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true },
        });
        const profiles = await this.prisma.rider_Profile.findMany({ where: { idEntrepreneur: { in: riderIds } } });
        const profilesById = new Map(profiles.map((p) => [p.idEntrepreneur, p]));
        const shipments = await this.prisma.shipments.findMany({
            where: { idClub, idAssignedRider: { in: riderIds } },
            select: { idAssignedRider: true, shipmentStatus: true },
        });
        return entrepreneurs.map((e) => {
            const profile = profilesById.get(e.id);
            const riderShipments = shipments.filter((s) => s.idAssignedRider === e.id);
            const totalDeliveries = riderShipments.filter((s) => s.shipmentStatus === 'Entregado').length;
            const currentAssignments = riderShipments.filter((s) => s.shipmentStatus === 'Asignado' || s.shipmentStatus === 'En_Camino').length;
            return {
                id: e.id,
                firstName: e.firstName,
                lastName: e.lastName,
                email: e.email,
                phoneNumber: e.phoneNumber,
                vehicleType: profile?.vehicleType ?? null,
                licensePlate: profile?.licensePlate ?? null,
                availability: profile?.availability ?? false,
                isActive: profile?.isActive ?? false,
                zonesCovered: profile?.zonesCovered ?? null,
                costPerKm: profile?.costPerKm ? profile.costPerKm.toString() : null,
                totalDeliveries,
                currentAssignments,
            };
        });
    }
    async update(id, dto) {
        const profile = await this.prisma.rider_Profile.findUnique({ where: { id } });
        if (!profile)
            throw new common_1.NotFoundException('Perfil de rider no encontrado');
        const updated = await this.prisma.rider_Profile.update({
            where: { id },
            data: { ...dto },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const profile = await this.prisma.rider_Profile.findUnique({ where: { id } });
        if (!profile)
            throw new common_1.NotFoundException('Perfil de rider no encontrado');
        await this.prisma.rider_Profile.delete({ where: { id } });
        return { message: 'Perfil de rider eliminado correctamente' };
    }
};
exports.RiderProfileService = RiderProfileService;
exports.RiderProfileService = RiderProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RiderProfileService);
//# sourceMappingURL=rider-profile.service.js.map