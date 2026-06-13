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
exports.EntrepreneurLicensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
function sanitize(license) {
    if (!license)
        return license;
    if (license.issueDate instanceof Date)
        license.issueDate = license.issueDate.toISOString();
    if (license.expirationDate instanceof Date)
        license.expirationDate = license.expirationDate.toISOString();
    if (license.verificationDate instanceof Date)
        license.verificationDate = license.verificationDate.toISOString();
    return license;
}
let EntrepreneurLicensesService = class EntrepreneurLicensesService {
    prisma;
    cloudinary;
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
    }
    async create(dto, documentFile) {
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({
            where: { id: dto.idEntrepreneurs },
        });
        if (!entrepreneur)
            throw new common_1.NotFoundException('Emprendedor no encontrado');
        const licenseType = await this.prisma.license_Types.findUnique({
            where: { id: dto.idLicenseTypes },
        });
        if (!licenseType)
            throw new common_1.NotFoundException('Tipo de licencia no encontrado');
        let documentUrl = dto.documentUrl ?? null;
        if (documentFile) {
            documentUrl = await this.cloudinary.uploadDocument(documentFile, 'aurabox/licenses');
        }
        const created = await this.prisma.entrepreneur_Licenses.create({
            data: {
                idEntrepreneurs: dto.idEntrepreneurs,
                idLicenseTypes: dto.idLicenseTypes,
                issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
                expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
                documentUrl,
                verificationNotes: dto.verificationNotes ?? null,
                verificationStatus: client_1.VerificationStatus.PENDIENTE,
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const licenses = await this.prisma.entrepreneur_Licenses.findMany({
            orderBy: { id: 'asc' },
        });
        return licenses.map(sanitize);
    }
    async findByEntrepreneur(idEntrepreneur) {
        const licenses = await this.prisma.entrepreneur_Licenses.findMany({
            where: { idEntrepreneurs: idEntrepreneur },
            orderBy: { id: 'desc' },
        });
        return licenses.map(sanitize);
    }
    async findOne(id) {
        const item = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Licencia no encontrada');
        return sanitize(item);
    }
    async update(id, dto) {
        const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Licencia no encontrada');
        if (dto.idEntrepreneurs) {
            const e = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.idEntrepreneurs } });
            if (!e)
                throw new common_1.NotFoundException('Emprendedor (nuevo) no encontrado');
        }
        if (dto.idLicenseTypes) {
            const lt = await this.prisma.license_Types.findUnique({ where: { id: dto.idLicenseTypes } });
            if (!lt)
                throw new common_1.NotFoundException('Tipo de licencia (nuevo) no encontrado');
        }
        const updated = await this.prisma.entrepreneur_Licenses.update({
            where: { id },
            data: {
                idEntrepreneurs: dto.idEntrepreneurs ?? existing.idEntrepreneurs,
                idLicenseTypes: dto.idLicenseTypes ?? existing.idLicenseTypes,
                issueDate: dto.issueDate ? new Date(dto.issueDate) : existing.issueDate,
                expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : existing.expirationDate,
                documentUrl: dto.documentUrl ?? existing.documentUrl,
                verificationNotes: dto.verificationNotes ?? existing.verificationNotes,
            },
        });
        return sanitize(updated);
    }
    async verify(id, verificationStatus, verificationNotes) {
        const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Licencia no encontrada');
        const allowed = Object.values(client_1.VerificationStatus);
        if (!allowed.includes(verificationStatus)) {
            throw new common_1.BadRequestException(`verificationStatus inválido. Valores permitidos: ${allowed.join(', ')}`);
        }
        const updated = await this.prisma.entrepreneur_Licenses.update({
            where: { id },
            data: {
                verificationStatus: verificationStatus,
                verificationDate: new Date(),
                verificationNotes: verificationNotes ?? existing.verificationNotes,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Licencia no encontrada');
        await this.prisma.entrepreneur_Licenses.delete({ where: { id } });
        return { message: 'Licencia eliminada correctamente' };
    }
};
exports.EntrepreneurLicensesService = EntrepreneurLicensesService;
exports.EntrepreneurLicensesService = EntrepreneurLicensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], EntrepreneurLicensesService);
//# sourceMappingURL=entrepreneur-licenses.service.js.map