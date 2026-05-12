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
exports.ClubsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitizeClub(club) {
    if (!club)
        return club;
    if (club.creationDate instanceof Date) {
        club.creationDate = club.creationDate.toISOString();
    }
    return club;
}
let ClubsService = class ClubsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(ownerId, dto) {
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({
            where: { id: ownerId },
        });
        if (!entrepreneur)
            throw new common_1.ForbiddenException('Solo entrepreneurs pueden crear clubs');
        const club = await this.prisma.club.create({
            data: {
                name: dto.name,
                logoUrl: dto.logoUrl,
                slogan: dto.slogan,
                history: dto.history,
                shortDescription: dto.shortDescription,
                contactEmail: dto.contactEmail,
                whatsappContact: dto.whatsappContact,
                clubStatus: dto.clubStatus ?? 'PENDIENTE_APROBACION',
            },
        });
        await this.prisma.entrepreneur_Club.create({
            data: {
                idEntrepreneurs: ownerId,
                idClub: club.id,
            },
        });
        return sanitizeClub(club);
    }
    async findAll() {
        const clubs = await this.prisma.club.findMany({
            orderBy: { creationDate: 'desc' },
        });
        return clubs.map(sanitizeClub);
    }
    async findOne(id) {
        const club = await this.prisma.club.findUnique({ where: { id } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        return sanitizeClub(club);
    }
    async update(id, userId, userRole, dto) {
        const club = await this.prisma.club.findUnique({ where: { id } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        if (userRole === 'OWNER') {
            const association = await this.prisma.entrepreneur_Club.findFirst({
                where: { idEntrepreneurs: userId, idClub: id },
            });
            if (!association)
                throw new common_1.ForbiddenException('No eres el owner de este club');
        }
        else if (userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('No autorizado para editar clubes');
        }
        const updated = await this.prisma.club.update({
            where: { id },
            data: dto,
        });
        return sanitizeClub(updated);
    }
    async remove(id, userRole) {
        if (userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Solo los administradores pueden eliminar clubes');
        }
        const club = await this.prisma.club.findUnique({ where: { id } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        await this.prisma.club.delete({ where: { id } });
        return { message: 'Club eliminado correctamente' };
    }
};
exports.ClubsService = ClubsService;
exports.ClubsService = ClubsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClubsService);
//# sourceMappingURL=clubs.service.js.map