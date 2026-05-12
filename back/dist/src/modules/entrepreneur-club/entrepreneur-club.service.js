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
exports.EntrepreneurClubService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(association) {
    if (!association)
        return association;
    if (association.associationDate instanceof Date)
        association.associationDate = association.associationDate.toISOString();
    return association;
}
let EntrepreneurClubService = class EntrepreneurClubService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({
            where: { id: dto.idEntrepreneurs },
        });
        if (!entrepreneur)
            throw new common_1.NotFoundException('Emprendedor no encontrado');
        const club = await this.prisma.club.findUnique({
            where: { id: dto.idClub },
        });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const exists = await this.prisma.entrepreneur_Club.findFirst({
            where: {
                idEntrepreneurs: dto.idEntrepreneurs,
                idClub: dto.idClub,
            },
        });
        if (exists)
            throw new common_1.ConflictException('La asociación ya existe');
        const created = await this.prisma.entrepreneur_Club.create({
            data: {
                idEntrepreneurs: dto.idEntrepreneurs,
                idClub: dto.idClub,
                associationDate: dto.associationDate ? new Date(dto.associationDate) : new Date(),
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const associations = await this.prisma.entrepreneur_Club.findMany({
            orderBy: { id: 'asc' },
        });
        return associations.map(sanitize);
    }
    async findByClub(idClub) {
        const associations = await this.prisma.entrepreneur_Club.findMany({
            where: { idClub },
            orderBy: { associationDate: 'desc' },
        });
        return associations.map(sanitize);
    }
    async findByEntrepreneur(idEntrepreneur) {
        const associations = await this.prisma.entrepreneur_Club.findMany({
            where: { idEntrepreneurs: idEntrepreneur },
            orderBy: { associationDate: 'desc' },
        });
        return associations.map(sanitize);
    }
    async findOne(id) {
        const item = await this.prisma.entrepreneur_Club.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Asociación no encontrada');
        return sanitize(item);
    }
    async update(id, dto) {
        const existing = await this.prisma.entrepreneur_Club.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Asociación no encontrada');
        if (dto.idEntrepreneurs) {
            const e = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.idEntrepreneurs } });
            if (!e)
                throw new common_1.NotFoundException('Emprendedor (nuevo) no encontrado');
        }
        if (dto.idClub) {
            const c = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
            if (!c)
                throw new common_1.NotFoundException('Club (nuevo) no encontrado');
        }
        const updated = await this.prisma.entrepreneur_Club.update({
            where: { id },
            data: {
                idEntrepreneurs: dto.idEntrepreneurs ?? existing.idEntrepreneurs,
                idClub: dto.idClub ?? existing.idClub,
                associationDate: dto.associationDate ? new Date(dto.associationDate) : existing.associationDate,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const existing = await this.prisma.entrepreneur_Club.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Asociación no encontrada');
        await this.prisma.entrepreneur_Club.delete({ where: { id } });
        return { message: 'Asociación eliminada correctamente' };
    }
};
exports.EntrepreneurClubService = EntrepreneurClubService;
exports.EntrepreneurClubService = EntrepreneurClubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EntrepreneurClubService);
//# sourceMappingURL=entrepreneur-club.service.js.map