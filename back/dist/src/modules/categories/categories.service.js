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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const exists = await this.prisma.categories.findFirst({
            where: { name: dto.name },
        });
        if (exists)
            throw new common_1.ConflictException('Ya existe una categoría con ese nombre');
        return this.prisma.categories.create({
            data: {
                name: dto.name,
                description: dto.description,
            },
        });
    }
    async findAll() {
        return this.prisma.categories.findMany({
            orderBy: { id: 'asc' },
        });
    }
    async findOne(id) {
        const cat = await this.prisma.categories.findUnique({ where: { id } });
        if (!cat)
            throw new common_1.NotFoundException('Categoría no encontrada');
        return cat;
    }
    async update(id, dto) {
        const existing = await this.prisma.categories.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Categoría no encontrada');
        if (dto.name && dto.name !== existing.name) {
            const dup = await this.prisma.categories.findFirst({ where: { name: dto.name } });
            if (dup)
                throw new common_1.ConflictException('Ya existe otra categoría con ese nombre');
        }
        return this.prisma.categories.update({
            where: { id },
            data: {
                name: dto.name ?? existing.name,
                description: dto.description ?? existing.description,
            },
        });
    }
    async remove(id) {
        const existing = await this.prisma.categories.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Categoría no encontrada');
        await this.prisma.categories.delete({ where: { id } });
        return { message: 'Categoría eliminada correctamente' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map