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
exports.ClubCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const club_categories_service_1 = require("./club-categories.service");
const create_club_category_dto_1 = require("./dto/create-club-category.dto");
const update_club_category_dto_1 = require("./dto/update-club-category.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ClubCategoriesController = class ClubCategoriesController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return this.service.create(dto);
    }
    async findAll() {
        return this.service.findAll();
    }
    async findByClub(idClub) {
        return this.service.findByClub(idClub);
    }
    async findByCategory(idCategory) {
        return this.service.findByCategory(idCategory);
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
    async update(id, dto) {
        return this.service.update(id, dto);
    }
    async remove(id) {
        return this.service.remove(id);
    }
};
exports.ClubCategoriesController = ClubCategoriesController;
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_club_category_dto_1.CreateClubCategoryDto]),
    __metadata("design:returntype", Promise)
], ClubCategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClubCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClubCategoriesController.prototype, "findByClub", null);
__decorate([
    (0, common_1.Get)('by-category/:idCategory'),
    __param(0, (0, common_1.Param)('idCategory', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClubCategoriesController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClubCategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Patch)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_club_category_dto_1.UpdateClubCategoryDto]),
    __metadata("design:returntype", Promise)
], ClubCategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClubCategoriesController.prototype, "remove", null);
exports.ClubCategoriesController = ClubCategoriesController = __decorate([
    (0, common_1.Controller)('club-categories'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [club_categories_service_1.ClubCategoriesService])
], ClubCategoriesController);
//# sourceMappingURL=club-categories.controller.js.map