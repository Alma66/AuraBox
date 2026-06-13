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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(review) {
    if (!review)
        return review;
    if (review.reviewDate instanceof Date)
        review.reviewDate = review.reviewDate.toISOString();
    if (review.lastEditDate instanceof Date)
        review.lastEditDate = review.lastEditDate.toISOString();
    return review;
}
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const existing = await this.prisma.reviews.findFirst({
            where: { idUser: dto.idUser, idClub: dto.idClub },
        });
        if (existing)
            throw new common_1.BadRequestException('Ya has reseñado este club');
        const created = await this.prisma.reviews.create({
            data: {
                idUser: dto.idUser,
                idClub: dto.idClub,
                rating: dto.rating,
                title: dto.title,
                comment: dto.comment,
                reviewDate: dto.reviewDate ? new Date(dto.reviewDate) : new Date(),
                lastEditDate: dto.lastEditDate ? new Date(dto.lastEditDate) : undefined,
                active: dto.active ?? true,
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const reviews = await this.prisma.reviews.findMany({
            orderBy: { reviewDate: 'desc' },
        });
        return reviews.map(sanitize);
    }
    async findOne(id) {
        const review = await this.prisma.reviews.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Reseña no encontrada');
        return sanitize(review);
    }
    async findByUser(idUser) {
        const reviews = await this.prisma.reviews.findMany({
            where: { idUser },
            orderBy: { reviewDate: 'desc' },
        });
        return reviews.map(sanitize);
    }
    async findByClub(idClub) {
        const reviews = await this.prisma.reviews.findMany({
            where: { idClub },
            orderBy: { reviewDate: 'desc' },
        });
        return reviews.map(sanitize);
    }
    async update(id, dto) {
        const review = await this.prisma.reviews.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Reseña no encontrada');
        const updated = await this.prisma.reviews.update({
            where: { id },
            data: {
                ...dto,
                lastEditDate: dto.lastEditDate ? new Date(dto.lastEditDate) : new Date(),
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const review = await this.prisma.reviews.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Reseña no encontrada');
        await this.prisma.reviews.delete({ where: { id } });
        return { message: 'Reseña eliminada correctamente' };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map