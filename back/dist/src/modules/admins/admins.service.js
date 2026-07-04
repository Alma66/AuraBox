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
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
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
    SALT_ROUNDS = 10;
    async create(dto) {
        const exists = await this.prisma.admins.findUnique({ where: { email: dto.email } });
        if (exists)
            throw new common_1.BadRequestException('Ya existe un admin con ese email');
        const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
        const created = await this.prisma.admins.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                passwordHash,
                documentType: dto.documentType,
                documentNumber: dto.documentNumber,
                phoneNumber: dto.phoneNumber,
                notes: dto.notes ?? null,
                active: dto.active ?? true,
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const admins = await this.prisma.admins.findMany({ orderBy: { createdAt: 'desc' } });
        return admins.map(sanitize);
    }
    async findOne(id) {
        const item = await this.prisma.admins.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Admin no encontrado');
        return sanitize(item);
    }
    async findByEmail(email) {
        const item = await this.prisma.admins.findUnique({ where: { email } });
        if (!item)
            throw new common_1.NotFoundException('Admin no encontrado por email');
        return sanitize(item);
    }
    async update(id, dto) {
        const item = await this.prisma.admins.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Admin no encontrado');
        let data = { ...dto };
        if (dto.password) {
            data.passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
            delete data.password;
        }
        const updated = await this.prisma.admins.update({
            where: { id },
            data,
        });
        return sanitize(updated);
    }
    async remove(id) {
        const item = await this.prisma.admins.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Admin no encontrado');
        await this.prisma.admins.delete({ where: { id } });
        return { message: 'Admin eliminado correctamente' };
    }
};
exports.AdminsService = AdminsService;
exports.AdminsService = AdminsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminsService);
//# sourceMappingURL=admins.service.js.map