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
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(favorite) {
    if (!favorite)
        return favorite;
    if (favorite.dateAdded instanceof Date)
        favorite.dateAdded = favorite.dateAdded.toISOString();
    return favorite;
}
let FavoritesService = class FavoritesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const existing = await this.prisma.favorites.findFirst({
            where: { idUser: dto.idUser, idClub: dto.idClub },
        });
        if (existing)
            throw new common_1.BadRequestException('Ya tienes este club en favoritos');
        const created = await this.prisma.favorites.create({
            data: {
                idUser: dto.idUser,
                idClub: dto.idClub,
                dateAdded: dto.dateAdded ? new Date(dto.dateAdded) : new Date(),
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const favorites = await this.prisma.favorites.findMany({
            orderBy: { dateAdded: 'desc' },
        });
        return favorites.map(sanitize);
    }
    async findOne(id) {
        const favorite = await this.prisma.favorites.findUnique({ where: { id } });
        if (!favorite)
            throw new common_1.NotFoundException('Favorito no encontrado');
        return sanitize(favorite);
    }
    async findByUser(idUser) {
        const favorites = await this.prisma.favorites.findMany({
            where: { idUser },
            orderBy: { dateAdded: 'desc' },
        });
        return favorites.map(sanitize);
    }
    async findByClub(idClub) {
        const favorites = await this.prisma.favorites.findMany({
            where: { idClub },
            orderBy: { dateAdded: 'desc' },
        });
        return favorites.map(sanitize);
    }
    async update(id, dto) {
        const favorite = await this.prisma.favorites.findUnique({ where: { id } });
        if (!favorite)
            throw new common_1.NotFoundException('Favorito no encontrado');
        const updated = await this.prisma.favorites.update({
            where: { id },
            data: {
                ...dto,
                dateAdded: dto.dateAdded ? new Date(dto.dateAdded) : favorite.dateAdded,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const favorite = await this.prisma.favorites.findUnique({ where: { id } });
        if (!favorite)
            throw new common_1.NotFoundException('Favorito no encontrado');
        await this.prisma.favorites.delete({ where: { id } });
        return { message: 'Favorito eliminado correctamente' };
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map