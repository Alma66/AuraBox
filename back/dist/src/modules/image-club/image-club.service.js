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
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(image) {
    if (!image)
        return image;
    if (image.uploadDate instanceof Date)
        image.uploadDate = image.uploadDate.toISOString();
    return image;
}
let ImageClubService = class ImageClubService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const created = await this.prisma.image_Club.create({
            data: {
                idClub: dto.idClub,
                imageUrl: dto.imageUrl,
                description: dto.description ?? null,
                contentType: dto.contentType ?? 'Imagen',
                uploadDate: dto.uploadDate ? new Date(dto.uploadDate) : new Date(),
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const images = await this.prisma.image_Club.findMany({ orderBy: { id: 'desc' } });
        return images.map(sanitize);
    }
    async findByClub(idClub) {
        const images = await this.prisma.image_Club.findMany({
            where: { idClub },
            orderBy: { id: 'desc' },
        });
        return images.map(sanitize);
    }
    async findOne(id) {
        const item = await this.prisma.image_Club.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Imagen no encontrada');
        return sanitize(item);
    }
    async update(id, dto) {
        const item = await this.prisma.image_Club.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Imagen no encontrada');
        const updated = await this.prisma.image_Club.update({
            where: { id },
            data: {
                ...dto,
                uploadDate: dto.uploadDate ? new Date(dto.uploadDate) : item.uploadDate,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const item = await this.prisma.image_Club.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Imagen no encontrada');
        await this.prisma.image_Club.delete({ where: { id } });
        return { message: 'Imagen eliminada correctamente' };
    }
};
exports.ImageClubService = ImageClubService;
exports.ImageClubService = ImageClubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImageClubService);
//# sourceMappingURL=image-club.service.js.map