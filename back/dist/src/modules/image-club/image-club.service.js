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
exports.ImageClubService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const DEFAULT_ACTIVE_SECTIONS = [client_1.ImageSection.Banner, client_1.ImageSection.Historia];
function sanitize(image) {
    if (!image)
        return image;
    if (image.uploadDate instanceof Date)
        image.uploadDate = image.uploadDate.toISOString();
    return image;
}
let ImageClubService = class ImageClubService {
    prisma;
    cloudinary;
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
    }
    async assertClubAccess(idClub, user) {
        if (user.role === 'admin')
            return;
        const assoc = await this.prisma.entrepreneur_Club.findFirst({
            where: { idClub, idEntrepreneurs: user.id },
        });
        if (!assoc)
            throw new common_1.ForbiddenException('No tenés acceso a este club');
    }
    async syncClubLogo(idClub, imageUrl) {
        await this.prisma.club.update({ where: { id: idClub }, data: { logoUrl: imageUrl } });
    }
    assertNoLogoInUse(items) {
        const inUse = items.some((i) => i.section === client_1.ImageSection.Logo && i.isActive);
        if (inUse) {
            throw new common_1.BadRequestException('No podés eliminar el logo en uso. Elegí otro logo antes.');
        }
    }
    async deleteAssetIfUnused(imageUrl) {
        if (!imageUrl)
            return;
        const [images, clubs, plans] = await Promise.all([
            this.prisma.image_Club.count({ where: { imageUrl } }),
            this.prisma.club.count({ where: { logoUrl: imageUrl } }),
            this.prisma.subscription_Types.count({ where: { imageUrl } }),
        ]);
        if (images + clubs + plans > 0)
            return;
        const publicId = this.cloudinary.extractPublicId(imageUrl);
        if (!publicId)
            return;
        try {
            await this.cloudinary.deleteImage(publicId);
        }
        catch { }
    }
    async create(dto, imageFile, user) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        await this.assertClubAccess(dto.idClub, user);
        let imageUrl = dto.imageUrl ?? '';
        if (imageFile) {
            imageUrl = await this.cloudinary.uploadImage(imageFile, 'aurabox/clubs/gallery');
        }
        if (!imageUrl)
            throw new common_1.BadRequestException('Se requiere una imagen');
        const section = dto.section ?? client_1.ImageSection.Banner;
        const isActive = dto.isActive ?? DEFAULT_ACTIVE_SECTIONS.includes(section);
        const makesLogoActive = isActive && section === client_1.ImageSection.Logo;
        if (makesLogoActive) {
            await this.prisma.image_Club.updateMany({
                where: { idClub: dto.idClub, section: client_1.ImageSection.Logo, isActive: true },
                data: { isActive: false },
            });
        }
        const created = await this.prisma.image_Club.create({
            data: {
                idClub: dto.idClub,
                imageUrl,
                description: dto.description ?? null,
                contentType: dto.contentType ?? 'Imagen',
                uploadDate: dto.uploadDate ? new Date(dto.uploadDate) : new Date(),
                uploadedBy: user.role === 'entrepreneur' ? user.id : null,
                section,
                isActive,
            },
        });
        if (makesLogoActive) {
            await this.syncClubLogo(dto.idClub, imageUrl);
        }
        return sanitize(created);
    }
    async findAll() {
        const images = await this.prisma.image_Club.findMany({ orderBy: { id: 'desc' } });
        return images.map(sanitize);
    }
    async findByClub(idClub, section) {
        if (section && !Object.values(client_1.ImageSection).includes(section)) {
            throw new common_1.BadRequestException('Sección inválida');
        }
        if (section === client_1.ImageSection.Logo) {
            await this.ensureLogoImage(idClub);
        }
        if (section) {
            await this.backfillSection(idClub, section);
        }
        const images = await this.prisma.image_Club.findMany({
            where: { idClub, ...(section ? { section: section } : {}) },
            orderBy: { id: 'desc' },
        });
        return images.map(sanitize);
    }
    async ensureLogoImage(idClub) {
        const existing = await this.prisma.image_Club.findFirst({
            where: { idClub, section: client_1.ImageSection.Logo },
        });
        if (existing)
            return;
        const club = await this.prisma.club.findUnique({ where: { id: idClub } });
        if (!club?.logoUrl)
            return;
        await this.prisma.image_Club.create({
            data: {
                idClub,
                imageUrl: club.logoUrl,
                contentType: 'Imagen',
                section: client_1.ImageSection.Logo,
                isActive: true,
            },
        });
    }
    async backfillSection(idClub, section) {
        if (section === client_1.ImageSection.Historia) {
            await this.prisma.image_Club.updateMany({
                where: { idClub, description: 'historia', NOT: { section: client_1.ImageSection.Historia } },
                data: { section: client_1.ImageSection.Historia },
            });
        }
        else if (section === client_1.ImageSection.Equipo) {
            await this.prisma.image_Club.updateMany({
                where: { idClub, description: { startsWith: 'team-' }, NOT: { section: client_1.ImageSection.Equipo } },
                data: { section: client_1.ImageSection.Equipo },
            });
        }
    }
    async findOne(id) {
        const item = await this.prisma.image_Club.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Imagen no encontrada');
        return sanitize(item);
    }
    async update(id, dto, user) {
        const item = await this.prisma.image_Club.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Imagen no encontrada');
        await this.assertClubAccess(item.idClub, user);
        const targetSection = dto.section ?? item.section;
        const targetActive = dto.isActive ?? item.isActive;
        const wasLogoInUse = item.section === client_1.ImageSection.Logo && item.isActive;
        const willBeLogoInUse = targetSection === client_1.ImageSection.Logo && targetActive;
        if (wasLogoInUse && !willBeLogoInUse) {
            throw new common_1.BadRequestException('Elegí otro logo para usar antes de quitar este.');
        }
        if (willBeLogoInUse && !wasLogoInUse) {
            await this.prisma.image_Club.updateMany({
                where: { idClub: item.idClub, section: client_1.ImageSection.Logo, isActive: true, id: { not: id } },
                data: { isActive: false },
            });
        }
        const data = {};
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.isActive !== undefined)
            data.isActive = dto.isActive;
        if (dto.section !== undefined)
            data.section = dto.section;
        if (dto.contentType !== undefined)
            data.contentType = dto.contentType;
        const updated = await this.prisma.image_Club.update({ where: { id }, data });
        if (willBeLogoInUse && !wasLogoInUse) {
            await this.syncClubLogo(item.idClub, item.imageUrl);
        }
        return sanitize(updated);
    }
    async remove(id, user) {
        const item = await this.prisma.image_Club.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Imagen no encontrada');
        await this.assertClubAccess(item.idClub, user);
        this.assertNoLogoInUse([item]);
        await this.prisma.image_Club.delete({ where: { id } });
        await this.deleteAssetIfUnused(item.imageUrl);
        return { message: 'Imagen eliminada correctamente' };
    }
    async removeMany(ids, user) {
        const cleanIds = Array.isArray(ids)
            ? Array.from(new Set(ids.map(Number).filter((n) => Number.isInteger(n) && n > 0)))
            : [];
        if (cleanIds.length === 0)
            throw new common_1.BadRequestException('No se indicaron imágenes');
        const items = await this.prisma.image_Club.findMany({ where: { id: { in: cleanIds } } });
        if (items.length === 0)
            throw new common_1.NotFoundException('Imágenes no encontradas');
        const clubIds = Array.from(new Set(items.map((i) => i.idClub)));
        for (const idClub of clubIds) {
            await this.assertClubAccess(idClub, user);
        }
        this.assertNoLogoInUse(items);
        await this.prisma.image_Club.deleteMany({ where: { id: { in: items.map((i) => i.id) } } });
        const urls = Array.from(new Set(items.map((i) => i.imageUrl)));
        for (const url of urls) {
            await this.deleteAssetIfUnused(url);
        }
        return { message: `${items.length} imágenes eliminadas correctamente` };
    }
};
exports.ImageClubService = ImageClubService;
exports.ImageClubService = ImageClubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], ImageClubService);
//# sourceMappingURL=image-club.service.js.map