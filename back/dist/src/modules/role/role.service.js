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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(role) {
    if (!role)
        return role;
    if (role.createdAt instanceof Date)
        role.createdAt = role.createdAt.toISOString();
    return role;
}
let RoleService = class RoleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const exists = await this.prisma.role.findUnique({ where: { code: dto.code } });
        if (exists)
            throw new common_1.ConflictException('Ya existe un rol con ese código');
        const created = await this.prisma.role.create({
            data: {
                code: dto.code,
                name: dto.name,
                description: dto.description,
                scope: dto.scope,
                createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const roles = await this.prisma.role.findMany({ orderBy: { createdAt: 'desc' } });
        return roles.map(sanitize);
    }
    async findByCode(code) {
        const role = await this.prisma.role.findUnique({ where: { code } });
        return role ? sanitize(role) : null;
    }
    async findOne(id) {
        const item = await this.prisma.role.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Rol no encontrado');
        return sanitize(item);
    }
    async update(id, dto) {
        const item = await this.prisma.role.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Rol no encontrado');
        if (dto.code && dto.code !== item.code) {
            const dup = await this.prisma.role.findUnique({ where: { code: dto.code } });
            if (dup)
                throw new common_1.ConflictException('Ya existe otro rol con ese código');
        }
        const updated = await this.prisma.role.update({
            where: { id },
            data: {
                ...dto,
                createdAt: dto.createdAt ? new Date(dto.createdAt) : item.createdAt,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const item = await this.prisma.role.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Rol no encontrado');
        await this.prisma.role.delete({ where: { id } });
        return { message: 'Rol eliminado correctamente' };
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoleService);
//# sourceMappingURL=role.service.js.map