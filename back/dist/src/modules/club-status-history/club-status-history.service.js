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
exports.ClubStatusHistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClubStatusHistoryService = class ClubStatusHistoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const admin = await this.prisma.admins.findUnique({ where: { id: dto.idAdmins } });
        if (!admin)
            throw new common_1.NotFoundException('Admin no encontrado');
        return this.prisma.club_Status_History.create({
            data: {
                idClub: dto.idClub,
                idAdmins: dto.idAdmins,
                previousStatus: dto.previousStatus,
                newStatus: dto.newStatus,
                changeDate: dto.changeDate ? new Date(dto.changeDate) : new Date(),
                changeReason: dto.changeReason ?? null,
            },
        });
    }
    async findAll() {
        return this.prisma.club_Status_History.findMany({ orderBy: { id: 'desc' } });
    }
    async findByClub(idClub) {
        return this.prisma.club_Status_History.findMany({
            where: { idClub },
            orderBy: { id: 'desc' },
        });
    }
    async findByAdmin(idAdmins) {
        return this.prisma.club_Status_History.findMany({
            where: { idAdmins },
            orderBy: { id: 'desc' },
        });
    }
    async findOne(id) {
        const item = await this.prisma.club_Status_History.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Registro de estado no encontrado');
        return item;
    }
    async update(id, dto) {
        const item = await this.prisma.club_Status_History.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Registro de estado no encontrado');
        if (dto.idClub) {
            const c = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
            if (!c)
                throw new common_1.NotFoundException('Club (nuevo) no encontrado');
        }
        if (dto.idAdmins) {
            const a = await this.prisma.admins.findUnique({ where: { id: dto.idAdmins } });
            if (!a)
                throw new common_1.NotFoundException('Admin (nuevo) no encontrado');
        }
        return this.prisma.club_Status_History.update({
            where: { id },
            data: {
                ...dto,
                changeDate: dto.changeDate ? new Date(dto.changeDate) : undefined,
            },
        });
    }
    async remove(id) {
        const item = await this.prisma.club_Status_History.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Registro de estado no encontrado');
        await this.prisma.club_Status_History.delete({ where: { id } });
        return { message: 'Registro de estado eliminado correctamente' };
    }
};
exports.ClubStatusHistoryService = ClubStatusHistoryService;
exports.ClubStatusHistoryService = ClubStatusHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClubStatusHistoryService);
//# sourceMappingURL=club-status-history.service.js.map