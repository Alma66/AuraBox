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
exports.LicenseTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LicenseTypesService = class LicenseTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const exists = await this.prisma.license_Types.findUnique({ where: { name: dto.name } });
        if (exists)
            throw new common_1.ConflictException('Ya existe un tipo de licencia con ese nombre');
        return this.prisma.license_Types.create({
            data: {
                name: dto.name,
                description: dto.description ?? null,
            },
        });
    }
    async findAll() {
        return this.prisma.license_Types.findMany({ orderBy: { id: 'desc' } });
    }
    async findByName(name) {
        return this.prisma.license_Types.findUnique({ where: { name } });
    }
    async findOne(id) {
        const item = await this.prisma.license_Types.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Tipo de licencia no encontrado');
        return item;
    }
    async update(id, dto) {
        const item = await this.prisma.license_Types.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Tipo de licencia no encontrado');
        if (dto.name && dto.name !== item.name) {
            const dup = await this.prisma.license_Types.findUnique({ where: { name: dto.name } });
            if (dup)
                throw new common_1.ConflictException('Ya existe otro tipo de licencia con ese nombre');
        }
        return this.prisma.license_Types.update({
            where: { id },
            data: {
                ...dto,
            },
        });
    }
    async remove(id) {
        const item = await this.prisma.license_Types.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Tipo de licencia no encontrado');
        await this.prisma.license_Types.delete({ where: { id } });
        return { message: 'Tipo de licencia eliminado correctamente' };
    }
};
exports.LicenseTypesService = LicenseTypesService;
exports.LicenseTypesService = LicenseTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LicenseTypesService);
//# sourceMappingURL=license-types.service.js.map