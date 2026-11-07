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
const license_requirements_1 = require("../../common/utils/license-requirements");
const DAY_MS = 24 * 60 * 60 * 1000;
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
    assertDates(issueDate, expirationDate, requireFutureExpiry) {
        if (issueDate && expirationDate && expirationDate.getTime() <= issueDate.getTime()) {
            throw new common_1.BadRequestException('El vencimiento debe ser posterior a la fecha de emisión');
        }
        if (requireFutureExpiry && expirationDate && expirationDate.getTime() < Date.now()) {
            throw new common_1.BadRequestException('La matrícula que intentás cargar ya está vencida');
        }
    }
    async create(dto, user, documentFile) {
        let idEntrepreneurs;
        if (user.role === 'admin') {
            if (!dto.idEntrepreneurs)
                throw new common_1.BadRequestException('Indicá el emprendedor');
            idEntrepreneurs = dto.idEntrepreneurs;
        }
        else {
            if (dto.idEntrepreneurs && dto.idEntrepreneurs !== user.id) {
                throw new common_1.ForbiddenException('No autorizado para crear esta licencia');
            }
            idEntrepreneurs = user.id;
        }
        if (!documentFile)
            throw new common_1.BadRequestException('Adjuntá el documento de la matrícula');
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: idEntrepreneurs } });
        if (!entrepreneur)
            throw new common_1.NotFoundException('Emprendedor no encontrado');
        const licenseType = await this.prisma.license_Types.findUnique({ where: { id: dto.idLicenseTypes } });
        if (!licenseType)
            throw new common_1.NotFoundException('Tipo de licencia no encontrado');
        const duplicate = await this.prisma.entrepreneur_Licenses.findFirst({
            where: { idEntrepreneurs, idLicenseTypes: dto.idLicenseTypes },
        });
        if (duplicate) {
            throw new common_1.ConflictException('Ya cargaste esta matrícula. Si querés renovarla, reemplazá el documento.');
        }
        const issueDate = dto.issueDate ? new Date(dto.issueDate) : null;
        const expirationDate = dto.expirationDate ? new Date(dto.expirationDate) : null;
        this.assertDates(issueDate, expirationDate, true);
        const documentUrl = await this.cloudinary.uploadDocument(documentFile, 'aurabox/licenses');
        const created = await this.prisma.entrepreneur_Licenses.create({
            data: {
                idEntrepreneurs,
                idLicenseTypes: dto.idLicenseTypes,
                issueDate,
                expirationDate,
                documentUrl,
                verificationStatus: client_1.VerificationStatus.PENDIENTE,
            },
        });
        return sanitize(created);
    }
    async adminList(status) {
        const validStatus = Object.values(client_1.VerificationStatus).includes(status)
            ? status
            : undefined;
        const licenses = await this.prisma.entrepreneur_Licenses.findMany({
            where: validStatus ? { verificationStatus: validStatus } : {},
            orderBy: { id: 'asc' },
            take: 300,
        });
        const entrepreneurIds = Array.from(new Set(licenses.map((row) => row.idEntrepreneurs)));
        const typeIds = Array.from(new Set(licenses.map((row) => row.idLicenseTypes)));
        const [entrepreneurs, types, links] = await Promise.all([
            this.prisma.entrepreneurs.findMany({
                where: { id: { in: entrepreneurIds } },
                select: { id: true, firstName: true, lastName: true, email: true },
            }),
            this.prisma.license_Types.findMany({ where: { id: { in: typeIds } }, select: { id: true, name: true } }),
            this.prisma.entrepreneur_Club.findMany({ where: { idEntrepreneurs: { in: entrepreneurIds } } }),
        ]);
        const clubs = await this.prisma.club.findMany({
            where: { id: { in: Array.from(new Set(links.map((row) => row.idClub))) } },
            select: { id: true, name: true, clubStatus: true },
        });
        const now = Date.now();
        return licenses.map((license) => {
            const entrepreneur = entrepreneurs.find((row) => row.id === license.idEntrepreneurs);
            const type = types.find((row) => row.id === license.idLicenseTypes);
            const entrepreneurClubs = links
                .filter((row) => row.idEntrepreneurs === license.idEntrepreneurs)
                .map((row) => clubs.find((club) => club.id === row.idClub))
                .filter((club) => !!club);
            return {
                id: license.id,
                verificationStatus: license.verificationStatus,
                documentUrl: license.documentUrl,
                issueDate: license.issueDate ? license.issueDate.toISOString() : null,
                expirationDate: license.expirationDate ? license.expirationDate.toISOString() : null,
                verificationDate: license.verificationDate ? license.verificationDate.toISOString() : null,
                verificationNotes: license.verificationNotes,
                daysToExpire: license.expirationDate
                    ? Math.ceil((license.expirationDate.getTime() - now) / DAY_MS)
                    : null,
                licenseType: type?.name ?? `Tipo #${license.idLicenseTypes}`,
                entrepreneur: entrepreneur
                    ? { id: entrepreneur.id, name: `${entrepreneur.firstName} ${entrepreneur.lastName}`, email: entrepreneur.email }
                    : null,
                clubs: entrepreneurClubs,
            };
        });
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
    async update(id, dto, user, documentFile) {
        const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Licencia no encontrada');
        if (existing.idEntrepreneurs !== user.id) {
            throw new common_1.ForbiddenException('No autorizado para actualizar esta licencia');
        }
        if (!documentFile && dto.issueDate === undefined && dto.expirationDate === undefined) {
            throw new common_1.BadRequestException('No hay cambios para guardar');
        }
        const issueDate = dto.issueDate ? new Date(dto.issueDate) : existing.issueDate;
        const expirationDate = dto.expirationDate ? new Date(dto.expirationDate) : existing.expirationDate;
        this.assertDates(issueDate, expirationDate, dto.expirationDate !== undefined);
        let documentUrl = existing.documentUrl;
        if (documentFile) {
            const newUrl = await this.cloudinary.uploadDocument(documentFile, 'aurabox/licenses');
            if (existing.documentUrl) {
                try {
                    const publicId = this.cloudinary.extractPublicId(existing.documentUrl);
                    await this.cloudinary.deleteImage(publicId);
                }
                catch { }
            }
            documentUrl = newUrl;
        }
        const updated = await this.prisma.entrepreneur_Licenses.update({
            where: { id },
            data: {
                issueDate,
                expirationDate,
                documentUrl,
                verificationStatus: client_1.VerificationStatus.PENDIENTE,
                verificationDate: null,
                verificationNotes: null,
            },
        });
        return sanitize(updated);
    }
    async verify(id, dto) {
        const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Licencia no encontrada');
        if (!existing.documentUrl)
            throw new common_1.BadRequestException('La licencia no tiene documento para revisar');
        const notes = dto.verificationNotes?.trim() || null;
        if (dto.verificationStatus === 'RECHAZADO' && !notes) {
            throw new common_1.BadRequestException('Indicá el motivo del rechazo');
        }
        const updated = await this.prisma.entrepreneur_Licenses.update({
            where: { id },
            data: {
                verificationStatus: dto.verificationStatus,
                verificationDate: new Date(),
                verificationNotes: notes,
            },
        });
        return sanitize(updated);
    }
    async findRequiredForClub(idClub, requesterId, requesterRole) {
        const club = await this.prisma.club.findUnique({ where: { id: idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        if (requesterRole !== 'admin') {
            const association = await this.prisma.entrepreneur_Club.findFirst({
                where: { idClub, idEntrepreneurs: requesterId },
            });
            if (!association)
                throw new common_1.ForbiddenException('No autorizado para ver estos requisitos');
        }
        const { items } = await (0, license_requirements_1.getLicenseRequirements)(this.prisma, idClub);
        return items.map((item) => ({
            idLicenseTypes: item.idLicenseTypes,
            name: item.name,
            description: item.description,
            entrepreneurLicenseId: item.entrepreneurLicenseId,
            verificationStatus: item.verificationStatus,
            documentUrl: item.documentUrl,
            issueDate: item.issueDate,
            expirationDate: item.expirationDate,
            verificationNotes: item.verificationNotes,
        }));
    }
    async getMyCompliance(user) {
        const association = await this.prisma.entrepreneur_Club.findFirst({
            where: { idEntrepreneurs: user.id },
            orderBy: { associationDate: 'asc' },
        });
        if (!association)
            return { hasClub: false };
        const club = await this.prisma.club.findUnique({
            where: { id: association.idClub },
            select: { id: true, name: true, clubStatus: true },
        });
        if (!club)
            return { hasClub: false };
        const lastChange = await this.prisma.club_Status_History.findFirst({
            where: { idClub: club.id },
            orderBy: { changeDate: 'desc' },
        });
        const { idEntrepreneur, items } = await (0, license_requirements_1.getLicenseRequirements)(this.prisma, club.id);
        const summary = (0, license_requirements_1.summarizeRequirements)(items);
        return {
            hasClub: true,
            isOwner: idEntrepreneur === user.id,
            club,
            statusReason: lastChange?.changeReason ?? null,
            statusChangedAt: lastChange ? lastChange.changeDate.toISOString() : null,
            requirements: items,
            summary,
        };
    }
    async remove(id) {
        const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Licencia no encontrada');
        if (existing.documentUrl) {
            try {
                const publicId = this.cloudinary.extractPublicId(existing.documentUrl);
                await this.cloudinary.deleteImage(publicId);
            }
            catch { }
        }
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