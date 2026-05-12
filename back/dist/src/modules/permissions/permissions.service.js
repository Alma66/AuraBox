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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(permission) {
    if (!permission)
        return permission;
    if (permission.createdAt instanceof Date)
        permission.createdAt = permission.createdAt.toISOString();
    return permission;
}
let PermissionsService = class PermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const exists = await this.prisma.permissions.findUnique({ where: { code: dto.code } });
        if (exists)
            throw new common_1.ConflictException('Ya existe un permiso con ese código');
        const created = await this.prisma.permissions.create({
            data: {
                code: dto.code,
                name: dto.name,
                description: dto.description,
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const permissions = await this.prisma.permissions.findMany({ orderBy: { createdAt: 'desc' } });
        return permissions.map(sanitize);
    }
    async findByCode(code) {
        const permission = await this.prisma.permissions.findUnique({ where: { code } });
        return permission ? sanitize(permission) : null;
    }
    async findOne(id) {
        const item = await this.prisma.permissions.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Permiso no encontrado');
        return sanitize(item);
    }
    async update(id, dto) {
        const item = await this.prisma.permissions.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Permiso no encontrado');
        if (dto.code && dto.code !== item.code) {
            const dup = await this.prisma.permissions.findUnique({ where: { code: dto.code } });
            if (dup)
                throw new common_1.ConflictException('Ya existe otro permiso con ese código');
        }
        const updated = await this.prisma.permissions.update({
            where: { id },
            data: { ...dto },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const item = await this.prisma.permissions.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Permiso no encontrado');
        await this.prisma.permissions.delete({ where: { id } });
        return { message: 'Permiso eliminado correctamente' };
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map