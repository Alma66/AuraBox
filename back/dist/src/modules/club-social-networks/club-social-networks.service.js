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
exports.ClubSocialNetworksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClubSocialNetworksService = class ClubSocialNetworksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const exists = await this.prisma.club_Social_Networks.findUnique({ where: { profileUrl: dto.profileUrl } });
        if (exists)
            throw new common_1.ConflictException('Ya existe una red social con esa URL de perfil');
        return this.prisma.club_Social_Networks.create({
            data: {
                idClub: dto.idClub,
                networkType: dto.networkType,
                profileUrl: dto.profileUrl,
            },
        });
    }
    async findAll() {
        return this.prisma.club_Social_Networks.findMany({ orderBy: { id: 'desc' } });
    }
    async findByClub(idClub) {
        return this.prisma.club_Social_Networks.findMany({
            where: { idClub },
            orderBy: { id: 'desc' },
        });
    }
    async findOne(id) {
        const item = await this.prisma.club_Social_Networks.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Red social no encontrada');
        return item;
    }
    async update(id, dto) {
        const existing = await this.prisma.club_Social_Networks.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Red social no encontrada');
        if (dto.profileUrl && dto.profileUrl !== existing.profileUrl) {
            const dup = await this.prisma.club_Social_Networks.findUnique({ where: { profileUrl: dto.profileUrl } });
            if (dup)
                throw new common_1.ConflictException('Ya existe otra red social con esa URL de perfil');
        }
        if (dto.idClub) {
            const c = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
            if (!c)
                throw new common_1.NotFoundException('Club (nuevo) no encontrado');
        }
        return this.prisma.club_Social_Networks.update({
            where: { id },
            data: { ...dto },
        });
    }
    async remove(id) {
        const existing = await this.prisma.club_Social_Networks.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Red social no encontrada');
        await this.prisma.club_Social_Networks.delete({ where: { id } });
        return { message: 'Red social eliminada correctamente' };
    }
};
exports.ClubSocialNetworksService = ClubSocialNetworksService;
exports.ClubSocialNetworksService = ClubSocialNetworksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClubSocialNetworksService);
//# sourceMappingURL=club-social-networks.service.js.map