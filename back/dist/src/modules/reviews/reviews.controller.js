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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const reviews_service_1 = require("./reviews.service");
const create_review_dto_1 = require("./dto/create-review.dto");
const update_review_dto_1 = require("./dto/update-review.dto");
const create_forbidden_word_dto_1 = require("./dto/create-forbidden-word.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const MAX_MEDIA_FILES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 30 * 1024 * 1024;
let ReviewsController = class ReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async create(dto, req) {
        return this.reviewsService.create(dto, req.user.id);
    }
    async checkEligibility(idSubscriptionTypes, req) {
        return this.reviewsService.checkEligibility(req.user.id, idSubscriptionTypes);
    }
    async addMedia(id, files, req) {
        if (!files || files.length === 0)
            throw new common_1.BadRequestException('No se recibió ningún archivo');
        for (const file of files) {
            if (file.mimetype.startsWith('image/') && file.size > MAX_IMAGE_BYTES) {
                throw new common_1.BadRequestException('Las imágenes no pueden superar los 5MB');
            }
        }
        return this.reviewsService.addMedia(id, files, req.user.id);
    }
    async removeMedia(id, mediaId, req) {
        return this.reviewsService.removeMedia(id, mediaId, req.user.id);
    }
    async findAll() {
        return this.reviewsService.findAll();
    }
    async findByUser(idUser, req) {
        if (req.user.role !== 'admin' && (req.user.role !== 'customer' || req.user.id !== idUser)) {
            throw new common_1.ForbiddenException('No autorizado para ver estas reseñas');
        }
        return this.reviewsService.findByUser(idUser);
    }
    async findBySubscriptionType(id, req, limit, offset) {
        return this.reviewsService.findBySubscriptionType(id, req.user, limit ? Number(limit) : 10, offset ? Number(offset) : 0);
    }
    async getSummaryByClub(idClub, req) {
        return this.reviewsService.getSummaryByClub(idClub, req.user);
    }
    async getSummaryBySubscriptionType(id, req) {
        return this.reviewsService.getSummaryBySubscriptionType(id, req.user);
    }
    async findByClub(idClub, includeHidden, req) {
        await this.reviewsService.assertClubAccess(idClub, req.user);
        return this.reviewsService.findByClub(idClub, includeHidden === 'true');
    }
    async findHiddenByClub(idClub, req) {
        await this.reviewsService.assertClubAccess(idClub, req.user);
        return this.reviewsService.findHiddenByClub(idClub);
    }
    async findForbiddenWords(idClub, req) {
        await this.reviewsService.assertClubAccess(idClub, req.user);
        return this.reviewsService.findForbiddenWordsByClub(idClub);
    }
    async createForbiddenWord(dto, req) {
        await this.reviewsService.assertClubAccess(dto.idClub, req.user);
        return this.reviewsService.createForbiddenWord(dto);
    }
    async toggleForbiddenWord(id, body, req) {
        return this.reviewsService.toggleForbiddenWord(id, body.active, req.user);
    }
    async removeForbiddenWord(id, req) {
        return this.reviewsService.removeForbiddenWord(id, req.user);
    }
    async findOne(id, req) {
        return this.reviewsService.findOneForRequester(id, req.user);
    }
    async update(id, dto, req) {
        return this.reviewsService.updateForRequester(id, dto, req.user);
    }
    async remove(id, req) {
        const review = await this.reviewsService.findOne(id);
        const isOwner = req.user.role === 'customer' && req.user.id === review.idUser;
        if (!isOwner && req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('No autorizado para eliminar esta reseña');
        }
        return this.reviewsService.remove(id);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_review_dto_1.CreateReviewDto, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    (0, common_1.Get)('eligibility/:idSubscriptionTypes'),
    __param(0, (0, common_1.Param)('idSubscriptionTypes', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "checkEligibility", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    (0, common_1.Post)(':id/media'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', MAX_MEDIA_FILES, {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: MAX_VIDEO_BYTES },
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/^(image\/(jpg|jpeg|png|gif|webp)|video\/(mp4|quicktime|webm))$/)) {
                callback(new common_1.BadRequestException('Formato de archivo no permitido'), false);
            }
            else {
                callback(null, true);
            }
        },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "addMedia", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    (0, common_1.Delete)(':id/media/:mediaId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('mediaId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "removeMedia", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-user/:idUser'),
    __param(0, (0, common_1.Param)('idUser', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findByUser", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('by-subscription-type/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String, String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findBySubscriptionType", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('summary/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getSummaryByClub", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('summary/by-subscription-type/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getSummaryBySubscriptionType", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('includeHidden')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findByClub", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('hidden-by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findHiddenByClub", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('forbidden-words/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findForbiddenWords", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Post)('forbidden-words'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_forbidden_word_dto_1.CreateForbiddenWordDto, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "createForbiddenWord", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Patch)('forbidden-words/:id/toggle'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "toggleForbiddenWord", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Delete)('forbidden-words/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "removeForbiddenWord", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_review_dto_1.UpdateReviewDto, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "remove", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map