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
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const club_visibility_1 = require("../../common/utils/club-visibility");
const MAX_MEDIA_PER_REVIEW = 5;
const REVIEW_WINDOW_AFTER_CANCEL_DAYS = 30;
const MAX_PAGE_SIZE = 50;
function sanitize(review) {
    if (!review)
        return review;
    if (review.reviewDate instanceof Date)
        review.reviewDate = review.reviewDate.toISOString();
    if (review.lastEditDate instanceof Date)
        review.lastEditDate = review.lastEditDate.toISOString();
    return review;
}
function mediaTypeFromMime(mimetype) {
    if (mimetype.startsWith('video/'))
        return 'Video';
    return 'Imagen';
}
let ReviewsService = class ReviewsService {
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
    async matchesForbiddenWord(idClub, text) {
        const words = await this.prisma.forbidden_Word.findMany({ where: { idClub, active: true } });
        const lower = text.toLowerCase();
        return words.some((w) => lower.includes(w.word.toLowerCase()));
    }
    async attachCustomerNames(reviews) {
        const userIds = Array.from(new Set(reviews.map((r) => r.idUser)));
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, firstName: true, lastName: true },
        });
        return reviews.map((r) => {
            const customer = users.find((u) => u.id === r.idUser);
            return {
                ...sanitize(r),
                customerFirstName: customer?.firstName ?? null,
                customerLastName: customer?.lastName ?? null,
            };
        });
    }
    async checkEligibility(idUser, idSubscriptionTypes) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - REVIEW_WINDOW_AFTER_CANCEL_DAYS);
        const subscription = await this.prisma.user_Subscriptions.findFirst({
            where: {
                idUser,
                idSubscriptionTypes,
                OR: [
                    { subscriptionStatus: 'Activa' },
                    { subscriptionStatus: 'Cancelada', cancellationDate: { gte: cutoff } },
                ],
            },
            orderBy: { startDate: 'desc' },
        });
        const existingReview = await this.prisma.reviews.findFirst({
            where: { idUser, idSubscriptionTypes },
        });
        return {
            eligible: !!subscription && !existingReview,
            alreadyReviewed: !!existingReview,
            hasEligibleSubscription: !!subscription,
        };
    }
    async create(dto, idUser) {
        const user = await this.prisma.user.findUnique({ where: { id: idUser } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const subscriptionType = await this.prisma.subscription_Types.findUnique({
            where: { id: dto.idSubscriptionTypes },
        });
        if (!subscriptionType)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        const { eligible, alreadyReviewed, hasEligibleSubscription } = await this.checkEligibility(idUser, dto.idSubscriptionTypes);
        if (alreadyReviewed)
            throw new common_1.BadRequestException('Ya reseñaste esta suscripción');
        if (!hasEligibleSubscription) {
            throw new common_1.ForbiddenException(`Solo podés reseñar suscripciones activas o canceladas en los últimos ${REVIEW_WINDOW_AFTER_CANCEL_DAYS} días`);
        }
        if (!eligible)
            throw new common_1.ForbiddenException('No estás habilitado para reseñar esta suscripción');
        const forbiddenMatch = await this.matchesForbiddenWord(subscriptionType.idClub, `${dto.title ?? ''} ${dto.comment ?? ''}`);
        const created = await this.prisma.reviews.create({
            data: {
                idUser,
                idClub: subscriptionType.idClub,
                idSubscriptionTypes: dto.idSubscriptionTypes,
                rating: dto.rating,
                title: dto.title,
                comment: dto.comment,
                reviewDate: new Date(),
                active: true,
                isHidden: forbiddenMatch,
                hiddenReason: forbiddenMatch ? 'Contiene palabra filtrada automáticamente' : null,
            },
            include: { media: true },
        });
        return sanitize(created);
    }
    async addMedia(reviewId, files, requesterId) {
        const review = await this.prisma.reviews.findUnique({
            where: { id: reviewId },
            include: { media: true },
        });
        if (!review)
            throw new common_1.NotFoundException('Reseña no encontrada');
        if (review.idUser !== requesterId)
            throw new common_1.ForbiddenException('No autorizado');
        const currentCount = review.media.length;
        if (currentCount + files.length > MAX_MEDIA_PER_REVIEW) {
            throw new common_1.BadRequestException(`Como máximo se permiten ${MAX_MEDIA_PER_REVIEW} archivos por reseña`);
        }
        let order = currentCount;
        for (const file of files) {
            const type = mediaTypeFromMime(file.mimetype);
            const url = type === 'Video'
                ? await this.cloudinary.uploadVideo(file, 'aurabox/reviews')
                : await this.cloudinary.uploadImage(file, 'aurabox/reviews');
            await this.prisma.review_Media.create({
                data: { idReview: reviewId, mediaUrl: url, mediaType: type, order },
            });
            order += 1;
        }
        return this.findOne(reviewId);
    }
    async removeMedia(reviewId, mediaId, requesterId) {
        const review = await this.prisma.reviews.findUnique({ where: { id: reviewId } });
        if (!review)
            throw new common_1.NotFoundException('Reseña no encontrada');
        if (review.idUser !== requesterId)
            throw new common_1.ForbiddenException('No autorizado');
        const media = await this.prisma.review_Media.findUnique({ where: { id: mediaId } });
        if (!media || media.idReview !== reviewId)
            throw new common_1.NotFoundException('Archivo no encontrado');
        try {
            const publicId = this.cloudinary.extractPublicId(media.mediaUrl);
            await this.cloudinary.deleteImage(publicId, media.mediaType === 'Video' ? 'video' : 'image');
        }
        catch { }
        await this.prisma.review_Media.delete({ where: { id: mediaId } });
        return this.findOne(reviewId);
    }
    async findAll() {
        const reviews = await this.prisma.reviews.findMany({
            orderBy: { reviewDate: 'desc' },
            include: { media: true },
        });
        return reviews.map(sanitize);
    }
    async findOne(id) {
        const review = await this.prisma.reviews.findUnique({ where: { id }, include: { media: true } });
        if (!review)
            throw new common_1.NotFoundException('Reseña no encontrada');
        return sanitize(review);
    }
    async findOneForRequester(id, user) {
        const review = await this.findOne(id);
        const isOwner = user.role === 'customer' && review.idUser === user.id;
        if (!isOwner) {
            const visible = await (0, club_visibility_1.canViewClub)(this.prisma, review.idClub, user);
            if (!visible)
                throw new common_1.NotFoundException('Reseña no encontrada');
        }
        if (!review.isHidden)
            return review;
        if (user.role === 'admin')
            return review;
        if (isOwner)
            return review;
        if (user.role === 'entrepreneur') {
            await this.assertClubAccess(review.idClub, user);
            return review;
        }
        throw new common_1.ForbiddenException('No autorizado para ver esta reseña');
    }
    async findByUser(idUser) {
        const reviews = await this.prisma.reviews.findMany({
            where: { idUser },
            orderBy: { reviewDate: 'desc' },
            include: { media: true },
        });
        return reviews.map(sanitize);
    }
    async findByClub(idClub, includeHidden = false) {
        const reviews = await this.prisma.reviews.findMany({
            where: { idClub, ...(includeHidden ? {} : { isHidden: false }) },
            orderBy: { reviewDate: 'desc' },
            include: { media: true },
        });
        return this.attachCustomerNames(reviews);
    }
    async findBySubscriptionType(idSubscriptionTypes, user, limit = 10, offset = 0) {
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
        if (!subType)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        await (0, club_visibility_1.assertClubVisible)(this.prisma, subType.idClub, user);
        const take = Number.isFinite(limit) ? Math.min(Math.max(Math.floor(limit), 1), MAX_PAGE_SIZE) : 10;
        const skip = Number.isFinite(offset) ? Math.max(Math.floor(offset), 0) : 0;
        const [reviews, total] = await Promise.all([
            this.prisma.reviews.findMany({
                where: { idSubscriptionTypes, isHidden: false },
                orderBy: { reviewDate: 'desc' },
                include: { media: true },
                take,
                skip,
            }),
            this.prisma.reviews.count({ where: { idSubscriptionTypes, isHidden: false } }),
        ]);
        return { reviews: reviews.map(sanitize), total };
    }
    async findHiddenByClub(idClub) {
        const reviews = await this.prisma.reviews.findMany({
            where: { idClub, isHidden: true },
            orderBy: { reviewDate: 'desc' },
            include: { media: true },
        });
        return this.attachCustomerNames(reviews);
    }
    async getSummaryByClub(idClub, user) {
        await (0, club_visibility_1.assertClubVisible)(this.prisma, idClub, user);
        const agg = await this.prisma.reviews.aggregate({
            where: { idClub, isHidden: false, active: true },
            _avg: { rating: true },
            _count: { rating: true },
        });
        return { average: agg._avg.rating ?? 0, count: agg._count.rating };
    }
    async getSummaryBySubscriptionType(idSubscriptionTypes, user) {
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
        if (!subType)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        await (0, club_visibility_1.assertClubVisible)(this.prisma, subType.idClub, user);
        const agg = await this.prisma.reviews.aggregate({
            where: { idSubscriptionTypes, isHidden: false, active: true },
            _avg: { rating: true },
            _count: { rating: true },
        });
        return { average: agg._avg.rating ?? 0, count: agg._count.rating };
    }
    async updateForRequester(id, dto, user) {
        const review = await this.findOne(id);
        const isOwner = user.role === 'customer' && user.id === review.idUser;
        if (isOwner) {
            const { isHidden, hiddenReason, ...ownerFields } = dto;
            const data = { ...ownerFields };
            if (ownerFields.title !== undefined || ownerFields.comment !== undefined) {
                const newTitle = ownerFields.title ?? review.title;
                const newComment = ownerFields.comment ?? review.comment;
                const forbidden = await this.matchesForbiddenWord(review.idClub, `${newTitle ?? ''} ${newComment ?? ''}`);
                if (forbidden) {
                    data.isHidden = true;
                    data.hiddenReason = 'Contiene palabra filtrada automáticamente';
                }
            }
            return this.update(id, data);
        }
        if (user.role === 'admin')
            return this.update(id, dto);
        if (user.role === 'entrepreneur') {
            await this.assertClubAccess(review.idClub, user);
            const { rating, title, comment, ...moderationFields } = dto;
            return this.update(id, moderationFields);
        }
        throw new common_1.ForbiddenException('No autorizado para editar esta reseña');
    }
    async update(id, dto) {
        const review = await this.prisma.reviews.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Reseña no encontrada');
        const updated = await this.prisma.reviews.update({
            where: { id },
            data: { ...dto, lastEditDate: new Date() },
            include: { media: true },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const review = await this.prisma.reviews.findUnique({ where: { id }, include: { media: true } });
        if (!review)
            throw new common_1.NotFoundException('Reseña no encontrada');
        for (const media of review.media) {
            try {
                const publicId = this.cloudinary.extractPublicId(media.mediaUrl);
                await this.cloudinary.deleteImage(publicId, media.mediaType === 'Video' ? 'video' : 'image');
            }
            catch { }
        }
        await this.prisma.reviews.delete({ where: { id } });
        return { message: 'Reseña eliminada correctamente' };
    }
    async createForbiddenWord(dto) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const created = await this.prisma.forbidden_Word.create({
            data: { idClub: dto.idClub, word: dto.word.toLowerCase().trim(), active: dto.active ?? true },
        });
        const matches = await this.prisma.reviews.findMany({
            where: { idClub: dto.idClub, isHidden: false },
        });
        const toHide = matches.filter((r) => `${r.title ?? ''} ${r.comment ?? ''}`.toLowerCase().includes(created.word));
        if (toHide.length > 0) {
            await this.prisma.reviews.updateMany({
                where: { id: { in: toHide.map((r) => r.id) } },
                data: { isHidden: true, hiddenReason: 'Contiene palabra filtrada automáticamente' },
            });
        }
        return created;
    }
    async findForbiddenWordsByClub(idClub) {
        return this.prisma.forbidden_Word.findMany({ where: { idClub }, orderBy: { createdAt: 'desc' } });
    }
    async removeForbiddenWord(id, user) {
        const word = await this.prisma.forbidden_Word.findUnique({ where: { id } });
        if (!word)
            throw new common_1.NotFoundException('Palabra no encontrada');
        await this.assertClubAccess(word.idClub, user);
        await this.prisma.forbidden_Word.delete({ where: { id } });
        return { message: 'Palabra eliminada correctamente' };
    }
    async toggleForbiddenWord(id, active, user) {
        const word = await this.prisma.forbidden_Word.findUnique({ where: { id } });
        if (!word)
            throw new common_1.NotFoundException('Palabra no encontrada');
        await this.assertClubAccess(word.idClub, user);
        return this.prisma.forbidden_Word.update({ where: { id }, data: { active } });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map