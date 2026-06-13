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
exports.RolePermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(rolePermission) {
    if (!rolePermission)
        return rolePermission;
    if (rolePermission.grantedAt instanceof Date)
        rolePermission.grantedAt = rolePermission.grantedAt.toISOString();
    return rolePermission;
}
let RolePermissionsService = class RolePermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const role = await this.prisma.role.findUnique({ where: { id: dto.idRole } });
        if (!role)
            throw new common_1.NotFoundException('Rol no encontrado');
        const permission = await this.prisma.permissions.findUnique({ where: { id: dto.idPermissions } });
        if (!permission)
            throw new common_1.NotFoundException('Permiso no encontrado');
        const admin = await this.prisma.admins.findUnique({ where: { id: dto.grantedById } });
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.grantedById } });
        if (!admin && !entrepreneur)
            throw new common_1.NotFoundException('Usuario que otorga el permiso no encontrado');
        const exists = await this.prisma.role_Permissions.findFirst({
            where: {
                idRole: dto.idRole,
                idPermissions: dto.idPermissions,
            },
        });
        if (exists)
            throw new common_1.ConflictException('La asignación rol-permiso ya existe');
        const created = await this.prisma.role_Permissions.create({
            data: {
                idRole: dto.idRole,
                idPermissions: dto.idPermissions,
                grantedById: dto.grantedById,
                grantedAt: dto.grantedAt ? new Date(dto.grantedAt) : new Date(),
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const permissions = await this.prisma.role_Permissions.findMany({ orderBy: { grantedAt: 'desc' } });
        return permissions.map(sanitize);
    }
    async findByRole(idRole) {
        const permissions = await this.prisma.role_Permissions.findMany({
            where: { idRole },
            orderBy: { grantedAt: 'desc' },
        });
        return permissions.map(sanitize);
    }
    async findByPermission(idPermissions) {
        const permissions = await this.prisma.role_Permissions.findMany({
            where: { idPermissions },
            orderBy: { grantedAt: 'desc' },
        });
        return permissions.map(sanitize);
    }
    async findOne(id) {
        const item = await this.prisma.role_Permissions.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Asignación de permiso no encontrada');
        return sanitize(item);
    }
    async update(id, dto) {
        const existing = await this.prisma.role_Permissions.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Asignación de permiso no encontrada');
        if (dto.idRole) {
            const r = await this.prisma.role.findUnique({ where: { id: dto.idRole } });
            if (!r)
                throw new common_1.NotFoundException('Rol (nuevo) no encontrado');
        }
        if (dto.idPermissions) {
            const p = await this.prisma.permissions.findUnique({ where: { id: dto.idPermissions } });
            if (!p)
                throw new common_1.NotFoundException('Permiso (nuevo) no encontrado');
        }
        if (dto.grantedById) {
            const admin = await this.prisma.admins.findUnique({ where: { id: dto.grantedById } });
            const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.grantedById } });
            if (!admin && !entrepreneur)
                throw new common_1.NotFoundException('Usuario que otorga el permiso (nuevo) no encontrado');
        }
        const updated = await this.prisma.role_Permissions.update({
            where: { id },
            data: {
                ...dto,
                grantedAt: dto.grantedAt ? new Date(dto.grantedAt) : existing.grantedAt,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const existing = await this.prisma.role_Permissions.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Asignación de permiso no encontrada');
        await this.prisma.role_Permissions.delete({ where: { id } });
        return { message: 'Asignación de permiso eliminada correctamente' };
    }
};
exports.RolePermissionsService = RolePermissionsService;
exports.RolePermissionsService = RolePermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolePermissionsService);
//# sourceMappingURL=role-permissions.service.js.map