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
exports.EntrepreneursController = void 0;
const common_1 = require("@nestjs/common");
const entrepreneurs_service_1 = require("./entrepreneurs.service");
const create_entrepreneurs_dto_1 = require("./dto/create-entrepreneurs.dto");
const update_entrepreneurs_dto_1 = require("./dto/update-entrepreneurs.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const clubs_service_1 = require("../clubs/clubs.service");
let EntrepreneursController = class EntrepreneursController {
    entrepreneursService;
    clubsService;
    constructor(entrepreneursService, clubsService) {
        this.entrepreneursService = entrepreneursService;
        this.clubsService = clubsService;
    }
    async create(dto) {
        return this.entrepreneursService.create(dto);
    }
    async getMe(req) {
        const entrepreneur = await this.entrepreneursService.findOne(req.user.id);
        const club = await this.clubsService.findClubByEntrepreneur(req.user.id);
        return {
            ...entrepreneur,
            managedClub: club ? { id: club.id, name: club.name, logoUrl: club.logoUrl } : null,
            managedClubId: club ? club.id : null,
        };
    }
    async verifyPassword(req, body) {
        return this.entrepreneursService.verifyPassword(req.user.id, body.password);
    }
    async updateMe(req, dto) {
        return this.entrepreneursService.update(req.user.id, dto);
    }
    async getMyClub(req) {
        const club = await this.clubsService.findClubByEntrepreneur(req.user.id);
        if (!club)
            return { message: 'No tenés un club asociado aún' };
        return club;
    }
    async findAll() {
        return this.entrepreneursService.findAll();
    }
    async findOne(id, req) {
        if (req.user.id !== id && req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('No autorizado para ver este emprendedor');
        }
        return this.entrepreneursService.findOne(id);
    }
    async update(id, dto, req) {
        if (req.user.id !== id && req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('No autorizado para actualizar este emprendedor');
        }
        return this.entrepreneursService.update(id, dto);
    }
    async deactivate(id) {
        return this.entrepreneursService.deactivate(id);
    }
    async remove(id) {
        return this.entrepreneursService.remove(id);
    }
};
exports.EntrepreneursController = EntrepreneursController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_entrepreneurs_dto_1.CreateEntrepreneurDto]),
    __metadata("design:returntype", Promise)
], EntrepreneursController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntrepreneursController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('me/verify-password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneursController.prototype, "verifyPassword", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_entrepreneurs_dto_1.UpdateEntrepreneurDto]),
    __metadata("design:returntype", Promise)
], EntrepreneursController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Get)('me/club'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntrepreneursController.prototype, "getMyClub", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EntrepreneursController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneursController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_entrepreneurs_dto_1.UpdateEntrepreneurDto, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneursController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Put)(':id/deactivate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EntrepreneursController.prototype, "deactivate", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EntrepreneursController.prototype, "remove", null);
exports.EntrepreneursController = EntrepreneursController = __decorate([
    (0, common_1.Controller)('entrepreneurs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [entrepreneurs_service_1.EntrepreneursService,
        clubs_service_1.ClubsService])
], EntrepreneursController);
//# sourceMappingURL=entrepreneurs.controller.js.map