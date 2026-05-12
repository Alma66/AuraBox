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
exports.UserClubPreferencesController = void 0;
const common_1 = require("@nestjs/common");
const user_club_preferences_service_1 = require("./user-club-preferences.service");
const create_user_club_preference_dto_1 = require("./dto/create-user-club-preference.dto");
const update_user_club_preference_dto_1 = require("./dto/update-user-club-preference.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let UserClubPreferencesController = class UserClubPreferencesController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async create(dto, req) {
        if (req.user.id !== dto.idUser && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('No autorizado para crear esta preferencia');
        }
        return this.svc.create(dto);
    }
    async findAll() {
        return this.svc.findAll();
    }
    async findByUser(idUser, req) {
        if (req.user.id !== idUser && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('No autorizado para ver estas preferencias');
        }
        return this.svc.findByUser(idUser);
    }
    async findByClub(idClub) {
        return this.svc.findByClub(idClub);
    }
    async findBySubscriptionType(idSubscriptionTypes) {
        return this.svc.findBySubscriptionType(idSubscriptionTypes);
    }
    async findOne(id) {
        return this.svc.findOne(id);
    }
    async update(id, dto, req) {
        return this.svc.update(id, dto, req.user);
    }
    async remove(id, req) {
        return this.svc.remove(id, req.user);
    }
};
exports.UserClubPreferencesController = UserClubPreferencesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_club_preference_dto_1.CreateUserClubPreferenceDto, Object]),
    __metadata("design:returntype", Promise)
], UserClubPreferencesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserClubPreferencesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-user/:idUser'),
    __param(0, (0, common_1.Param)('idUser', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserClubPreferencesController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserClubPreferencesController.prototype, "findByClub", null);
__decorate([
    (0, common_1.Get)('by-subscription-type/:idSubscriptionTypes'),
    __param(0, (0, common_1.Param)('idSubscriptionTypes', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserClubPreferencesController.prototype, "findBySubscriptionType", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserClubPreferencesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_club_preference_dto_1.UpdateUserClubPreferenceDto, Object]),
    __metadata("design:returntype", Promise)
], UserClubPreferencesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserClubPreferencesController.prototype, "remove", null);
exports.UserClubPreferencesController = UserClubPreferencesController = __decorate([
    (0, common_1.Controller)('user-club-preferences'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_club_preferences_service_1.UserClubPreferencesService])
], UserClubPreferencesController);
//# sourceMappingURL=user-club-preferences.controller.js.map