"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const SALT_ROUNDS = 10;
const ADMIN_SELECT = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    documentType: true,
    documentNumber: true,
    phoneNumber: true,
    active: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
};
function sanitize(admin) {
    if (!admin)
        return admin;
    if (admin.createdAt instanceof Date)
        admin.createdAt = admin.createdAt.toISOString();
    if (admin.updatedAt instanceof Date)
        admin.updatedAt = admin.updatedAt.toISOString();
    return admin;
}
let AdminsService = class AdminsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async emailTaken(email) {
        const where = { email: { equals: email, mode: 'insensitive' } };
        const [admin, user, entrepreneur] = await Promise.all([
            this.prisma.admins.findFirst({ where, select: { id: true } }),
            this.prisma.user.findFirst({ where, select: { id: true } }),
            this.prisma.entrepreneurs.findFirst({ where, select: { id: true } }),
        ]);
        return !!(admin || user || entrepreneur);
    }
    async create(dto) {
        const email = dto.email.trim().toLowerCase();
        if (await this.emailTaken(email)) {
            throw new common_1.BadRequestException('Ese email ya está registrado en la plataforma');
        }
        const documentTaken = await this.prisma.admins.findUnique({
            where: { documentNumber: dto.documentNumber },
            select: { id: true },
        });
        if (documentTaken)
            throw new common_1.BadRequestException('Ya existe un admin con ese documento');
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        try {
            const created = await this.prisma.admins.create({
                data: {
                    firstName: dto.firstName.trim(),
                    lastName: dto.lastName.trim(),
                    email,
                    passwordHash,
                    documentType: dto.documentType,
                    documentNumber: dto.documentNumber,
                    phoneNumber: dto.phoneNumber ?? null,
                    notes: dto.notes?.trim() || null,
                    active: true,
                },
                select: ADMIN_SELECT,
            });
            return sanitize(created);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new common_1.BadRequestException('Ya existe un admin con ese email o documento');
            }
            throw error;
        }
    }
    async findAll() {
        const admins = await this.prisma.admins.findMany({
            orderBy: { createdAt: 'desc' },
            select: ADMIN_SELECT,
        });
        return admins.map(sanitize);
    }
    async findOne(id) {
        const item = await this.prisma.admins.findUnique({ where: { id }, select: ADMIN_SELECT });
        if (!item)
            throw new common_1.NotFoundException('Admin no encontrado');
        return sanitize(item);
    }
    async findByEmail(email) {
        const item = await this.prisma.admins.findFirst({
            where: { email: { equals: email.trim(), mode: 'insensitive' } },
            select: ADMIN_SELECT,
        });
        if (!item)
            throw new common_1.NotFoundException('Admin no encontrado por email');
        return sanitize(item);
    }
    async update(id, dto) {
        const exists = await this.prisma.admins.findUnique({ where: { id }, select: { id: true } });
        if (!exists)
            throw new common_1.NotFoundException('Admin no encontrado');
        const updated = await this.prisma.admins.update({
            where: { id },
            data: {
                ...(dto.firstName !== undefined ? { firstName: dto.firstName.trim() } : {}),
                ...(dto.lastName !== undefined ? { lastName: dto.lastName.trim() } : {}),
                ...(dto.phoneNumber !== undefined ? { phoneNumber: dto.phoneNumber } : {}),
                ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {}),
                updatedAt: new Date(),
            },
            select: ADMIN_SELECT,
        });
        return sanitize(updated);
    }
    async setActive(id, active, requesterId) {
        const target = await this.prisma.admins.findUnique({ where: { id }, select: { id: true, active: true } });
        if (!target)
            throw new common_1.NotFoundException('Admin no encontrado');
        if (!active) {
            if (id === requesterId) {
                throw new common_1.BadRequestException('No podés desactivar tu propia cuenta');
            }
            const otherActive = await this.prisma.admins.count({ where: { active: true, id: { not: id } } });
            if (otherActive === 0) {
                throw new common_1.BadRequestException('Tiene que quedar al menos un administrador activo');
            }
        }
        const updated = await this.prisma.admins.update({
            where: { id },
            data: { active, updatedAt: new Date() },
            select: ADMIN_SELECT,
        });
        return sanitize(updated);
    }
    async setPassword(id, password) {
        const exists = await this.prisma.admins.findUnique({ where: { id }, select: { id: true } });
        if (!exists)
            throw new common_1.NotFoundException('Admin no encontrado');
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        await this.prisma.admins.update({
            where: { id },
            data: { passwordHash, updatedAt: new Date() },
        });
        return { message: 'Contraseña actualizada correctamente' };
    }
};
exports.AdminsService = AdminsService;
exports.AdminsService = AdminsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminsService);
//# sourceMappingURL=admins.service.js.map