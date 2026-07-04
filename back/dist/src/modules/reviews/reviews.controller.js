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
const reviews_service_1 = require("./reviews.service");
const create_review_dto_1 = require("./dto/create-review.dto");
const update_review_dto_1 = require("./dto/update-review.dto");
const create_forbidden_word_dto_1 = require("./dto/create-forbidden-word.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ReviewsController = class ReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async create(dto, req) {
        if (req.user.id !== dto.idUser && req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('No autorizado para crear esta reseña');
        }
        return this.reviewsService.create(dto);
    }
    async findAll() {
        return this.reviewsService.findAll();
    }
    async findByUser(idUser, req) {
        if (req.user.id !== idUser && req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('No autorizado para ver estas reseñas');
        }
        return this.reviewsService.findByUser(idUser);
    }
    async findByClub(idClub, includeHidden) {
        return this.reviewsService.findByClub(idClub, includeHidden === 'true');
    }
    async findHiddenByClub(idClub) {
        return this.reviewsService.findHiddenByClub(idClub);
    }
    async findForbiddenWords(idClub) {
        return this.reviewsService.findForbiddenWordsByClub(idClub);
    }
    async createForbiddenWord(dto) {
        return this.reviewsService.createForbiddenWord(dto);
    }
    async toggleForbiddenWord(id, body) {
        return this.reviewsService.toggleForbiddenWord(id, body.active);
    }
    async removeForbiddenWord(id) {
        return this.reviewsService.removeForbiddenWord(id);
    }
    async findOne(id) {
        return this.reviewsService.findOne(id);
    }
    async update(id, dto) {
        return this.reviewsService.update(id, dto);
    }
    async remove(id) {
        return this.reviewsService.remove(id);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
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
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('includeHidden')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findByClub", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('hidden-by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findHiddenByClub", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('forbidden-words/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findForbiddenWords", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Post)('forbidden-words'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_forbidden_word_dto_1.CreateForbiddenWordDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "createForbiddenWord", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Patch)('forbidden-words/:id/toggle'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "toggleForbiddenWord", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Delete)('forbidden-words/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "removeForbiddenWord", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_review_dto_1.UpdateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "remove", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map