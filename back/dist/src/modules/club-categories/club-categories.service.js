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
exports.ClubCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClubCategoriesService = class ClubCategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const category = await this.prisma.categories.findUnique({ where: { id: dto.idCategories } });
        if (!category)
            throw new common_1.NotFoundException('Categoría no encontrada');
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const exists = await this.prisma.club_Categories.findFirst({
            where: { idCategories: dto.idCategories, idClub: dto.idClub },
        });
        if (exists)
            throw new common_1.ConflictException('La relación categoría-club ya existe');
        return this.prisma.club_Categories.create({
            data: {
                idCategories: dto.idCategories,
                idClub: dto.idClub,
            },
        });
    }
    async findAll() {
        return this.prisma.club_Categories.findMany({ orderBy: { id: 'asc' } });
    }
    async findByClub(idClub) {
        return this.prisma.club_Categories.findMany({
            where: { idClub },
            orderBy: { id: 'asc' },
        });
    }
    async findByCategory(idCategory) {
        return this.prisma.club_Categories.findMany({
            where: { idCategories: idCategory },
            orderBy: { id: 'asc' },
        });
    }
    async findOne(id) {
        const item = await this.prisma.club_Categories.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Relación no encontrada');
        return item;
    }
    async update(id, dto) {
        const existing = await this.prisma.club_Categories.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Relación no encontrada');
        if (dto.idCategories) {
            const c = await this.prisma.categories.findUnique({ where: { id: dto.idCategories } });
            if (!c)
                throw new common_1.NotFoundException('Categoría (nueva) no encontrada');
        }
        if (dto.idClub) {
            const cl = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
            if (!cl)
                throw new common_1.NotFoundException('Club (nuevo) no encontrado');
        }
        if (dto.idCategories || dto.idClub) {
            const newIdCategories = dto.idCategories ?? existing.idCategories;
            const newIdClub = dto.idClub ?? existing.idClub;
            const duplicate = await this.prisma.club_Categories.findFirst({
                where: { idCategories: newIdCategories, idClub: newIdClub, NOT: { id } },
            });
            if (duplicate)
                throw new common_1.ConflictException('Otra relación con esos valores ya existe');
        }
        return this.prisma.club_Categories.update({
            where: { id },
            data: {
                idCategories: dto.idCategories ?? existing.idCategories,
                idClub: dto.idClub ?? existing.idClub,
            },
        });
    }
    async remove(id) {
        const existing = await this.prisma.club_Categories.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Relación no encontrada');
        await this.prisma.club_Categories.delete({ where: { id } });
        return { message: 'Relación eliminada correctamente' };
    }
};
exports.ClubCategoriesService = ClubCategoriesService;
exports.ClubCategoriesService = ClubCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClubCategoriesService);
//# sourceMappingURL=club-categories.service.js.map