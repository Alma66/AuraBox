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
exports.AdminOrEntrepreneurRoleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(roleAssignment) {
    if (!roleAssignment)
        return roleAssignment;
    if (roleAssignment.assignedAt instanceof Date)
        roleAssignment.assignedAt = roleAssignment.assignedAt.toISOString();
    return roleAssignment;
}
let AdminOrEntrepreneurRoleService = class AdminOrEntrepreneurRoleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const role = await this.prisma.role.findUnique({ where: { id: dto.idRole } });
        if (!role)
            throw new common_1.NotFoundException('Rol no encontrado');
        if (dto.assignedToType === 'Admins') {
            const admin = await this.prisma.admins.findUnique({ where: { id: dto.assignedTo } });
            if (!admin)
                throw new common_1.NotFoundException('Admin asignado no encontrado');
        }
        else if (dto.assignedToType === 'Entrepreneur') {
            const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.assignedTo } });
            if (!entrepreneur)
                throw new common_1.NotFoundException('Emprendedor asignado no encontrado');
        }
        if (dto.assignedByType === 'Admins') {
            const adminBy = await this.prisma.admins.findUnique({ where: { id: dto.assignedBy } });
            if (!adminBy)
                throw new common_1.NotFoundException('Admin asignador no encontrado');
        }
        else if (dto.assignedByType === 'Entrepreneur') {
            const entrepreneurBy = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.assignedBy } });
            if (!entrepreneurBy)
                throw new common_1.NotFoundException('Emprendedor asignador no encontrado');
        }
        const created = await this.prisma.adminOrEntrepreneurRole.create({
            data: {
                idRole: dto.idRole,
                assignedToType: dto.assignedToType,
                assignedTo: dto.assignedTo,
                assignedByType: dto.assignedByType,
                assignedBy: dto.assignedBy,
                assignedAt: dto.assignedAt ? new Date(dto.assignedAt) : new Date(),
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const assignments = await this.prisma.adminOrEntrepreneurRole.findMany({ orderBy: { assignedAt: 'desc' } });
        return assignments.map(sanitize);
    }
    async findOne(id) {
        const item = await this.prisma.adminOrEntrepreneurRole.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Asignación no encontrada');
        return sanitize(item);
    }
    async findByAssignedTo(assignedTo) {
        const assignments = await this.prisma.adminOrEntrepreneurRole.findMany({
            where: { assignedTo },
            orderBy: { assignedAt: 'desc' },
        });
        return assignments.map(sanitize);
    }
    async findByRole(idRole) {
        const assignments = await this.prisma.adminOrEntrepreneurRole.findMany({
            where: { idRole },
            orderBy: { assignedAt: 'desc' },
        });
        return assignments.map(sanitize);
    }
    async update(id, dto) {
        const existing = await this.prisma.adminOrEntrepreneurRole.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Asignación no encontrada');
        if (dto.idRole) {
            const r = await this.prisma.role.findUnique({ where: { id: dto.idRole } });
            if (!r)
                throw new common_1.NotFoundException('Rol (nuevo) no encontrado');
        }
        if (dto.assignedTo && dto.assignedToType) {
            if (dto.assignedToType === 'Admins') {
                const a = await this.prisma.admins.findUnique({ where: { id: dto.assignedTo } });
                if (!a)
                    throw new common_1.NotFoundException('Admin asignado (nuevo) no encontrado');
            }
            else if (dto.assignedToType === 'Entrepreneur') {
                const e = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.assignedTo } });
                if (!e)
                    throw new common_1.NotFoundException('Emprendedor asignado (nuevo) no encontrado');
            }
        }
        if (dto.assignedBy && dto.assignedByType) {
            if (dto.assignedByType === 'Admins') {
                const ab = await this.prisma.admins.findUnique({ where: { id: dto.assignedBy } });
                if (!ab)
                    throw new common_1.NotFoundException('Admin asignador (nuevo) no encontrado');
            }
            else if (dto.assignedByType === 'Entrepreneur') {
                const eb = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.assignedBy } });
                if (!eb)
                    throw new common_1.NotFoundException('Emprendedor asignador (nuevo) no encontrado');
            }
        }
        const updated = await this.prisma.adminOrEntrepreneurRole.update({
            where: { id },
            data: {
                ...dto,
                assignedAt: dto.assignedAt ? new Date(dto.assignedAt) : existing.assignedAt,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const existing = await this.prisma.adminOrEntrepreneurRole.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Asignación no encontrada');
        await this.prisma.adminOrEntrepreneurRole.delete({ where: { id } });
        return { message: 'Asignación eliminada correctamente' };
    }
};
exports.AdminOrEntrepreneurRoleService = AdminOrEntrepreneurRoleService;
exports.AdminOrEntrepreneurRoleService = AdminOrEntrepreneurRoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminOrEntrepreneurRoleService);
//# sourceMappingURL=admin-or-entrepreneur-role.service.js.map