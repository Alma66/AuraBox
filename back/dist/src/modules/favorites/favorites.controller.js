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
exports.FavoritesController = void 0;
const common_1 = require("@nestjs/common");
const favorites_service_1 = require("./favorites.service");
const create_favorite_dto_1 = require("./dto/create-favorite.dto");
const update_favorite_dto_1 = require("./dto/update-favorite.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let FavoritesController = class FavoritesController {
    favoritesService;
    constructor(favoritesService) {
        this.favoritesService = favoritesService;
    }
    async create(dto, req) {
        const idUser = dto.idUser ?? req.user.id;
        if (req.user.id !== idUser && req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('No autorizado para crear este favorito');
        }
        return this.favoritesService.create({ ...dto, idUser });
    }
    async toggle(idSubscriptionTypes, req) {
        return this.favoritesService.toggle(req.user.id, idSubscriptionTypes);
    }
    async findAll() {
        return this.favoritesService.findAll();
    }
    async findByUser(idUser, req) {
        if (req.user.id !== idUser && req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('No autorizado para ver estos favoritos');
        }
        return this.favoritesService.findByUserEnriched(idUser);
    }
    async findByPlan(idSubscriptionTypes, req) {
        return this.favoritesService.findByPlanForRequester(idSubscriptionTypes, req.user);
    }
    async check(idSubscriptionTypes, req) {
        return this.favoritesService.check(req.user.id, idSubscriptionTypes);
    }
    async findOne(id, req) {
        const favorite = await this.favoritesService.findOne(id);
        if (req.user.role !== 'admin' && req.user.id !== favorite.idUser) {
            throw new common_1.ForbiddenException('No autorizado para ver este favorito');
        }
        return favorite;
    }
    async update(id, dto) {
        return this.favoritesService.update(id, dto);
    }
    async remove(id) {
        return this.favoritesService.remove(id);
    }
};
exports.FavoritesController = FavoritesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_favorite_dto_1.CreateFavoriteDto, Object]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('toggle/:idSubscriptionTypes'),
    __param(0, (0, common_1.Param)('idSubscriptionTypes', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "toggle", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-user/:idUser'),
    __param(0, (0, common_1.Param)('idUser', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "findByUser", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('by-plan/:idSubscriptionTypes'),
    __param(0, (0, common_1.Param)('idSubscriptionTypes', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "findByPlan", null);
__decorate([
    (0, common_1.Get)('check/:idSubscriptionTypes'),
    __param(0, (0, common_1.Param)('idSubscriptionTypes', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "check", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_favorite_dto_1.UpdateFavoriteDto]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "remove", null);
exports.FavoritesController = FavoritesController = __decorate([
    (0, common_1.Controller)('favorites'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'admin'),
    __metadata("design:paramtypes", [favorites_service_1.FavoritesService])
], FavoritesController);
//# sourceMappingURL=favorites.controller.js.map