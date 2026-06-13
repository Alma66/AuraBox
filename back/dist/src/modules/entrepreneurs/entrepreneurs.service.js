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
exports.EntrepreneursService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
function sanitize(entrepreneur) {
    if (!entrepreneur)
        return entrepreneur;
    if (entrepreneur.registrationDate instanceof Date)
        entrepreneur.registrationDate = entrepreneur.registrationDate.toISOString();
    if (entrepreneur.birthDate instanceof Date)
        entrepreneur.birthDate = entrepreneur.birthDate.toISOString();
    return entrepreneur;
}
let EntrepreneursService = class EntrepreneursService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const exists = await this.prisma.entrepreneurs.findFirst({
            where: { OR: [{ email: dto.email }, { documentNumber: dto.documentNumber }] },
        });
        if (exists)
            throw new common_1.ConflictException('Email o documento ya registrado');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const created = await this.prisma.entrepreneurs.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                passwordHash,
                documentType: dto.documentType,
                documentNumber: dto.documentNumber,
                cuitCuil: dto.cuitCuil ?? null,
                phoneNumber: dto.phoneNumber ?? null,
                birthDate: new Date(dto.birthDate),
                registrationDate: new Date(),
                city: dto.city ?? null,
                province: dto.province ?? null,
                active: dto.active ?? true,
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const entrepreneurs = await this.prisma.entrepreneurs.findMany({
            orderBy: { id: 'asc' },
        });
        return entrepreneurs.map(sanitize);
    }
    async findOne(id) {
        const ent = await this.prisma.entrepreneurs.findUnique({ where: { id } });
        if (!ent)
            throw new common_1.NotFoundException('Emprendedor no encontrado');
        return sanitize(ent);
    }
    async findByEmail(email) {
        return this.prisma.entrepreneurs.findUnique({ where: { email } });
    }
    async update(id, dto) {
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id } });
        if (!entrepreneur)
            throw new common_1.NotFoundException('Emprendedor no encontrado');
        if (dto.password) {
            dto.passwordHash = await bcrypt.hash(dto.password, 10);
            delete dto.password;
        }
        const data = { ...dto };
        if (data.birthDate) {
            data.birthDate = new Date(data.birthDate);
        }
        const updated = await this.prisma.entrepreneurs.update({
            where: { id },
            data,
        });
        return sanitize(updated);
    }
    async deactivate(id) {
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id } });
        if (!entrepreneur)
            throw new common_1.NotFoundException('Emprendedor no encontrado');
        const updated = await this.prisma.entrepreneurs.update({
            where: { id },
            data: { active: false },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id } });
        if (!entrepreneur)
            throw new common_1.NotFoundException('Emprendedor no encontrado');
        await this.prisma.entrepreneurs.delete({ where: { id } });
        return { message: 'Emprendedor eliminado correctamente' };
    }
};
exports.EntrepreneursService = EntrepreneursService;
exports.EntrepreneursService = EntrepreneursService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EntrepreneursService);
//# sourceMappingURL=entrepreneurs.service.js.map