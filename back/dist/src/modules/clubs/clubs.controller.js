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
exports.ClubsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const clubs_service_1 = require("./clubs.service");
const create_club_dto_1 = require("./dto/create-club.dto");
const update_club_dto_1 = require("./dto/update-club.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const shipments_service_1 = require("../shipments/shipments.service");
const rider_profile_service_1 = require("../rider-profile/rider-profile.service");
const assign_delivery_dto_1 = require("../shipments/dto/assign-delivery.dto");
let ClubsController = class ClubsController {
    clubsService;
    shipmentsService;
    riderProfileService;
    constructor(clubsService, shipmentsService, riderProfileService) {
        this.clubsService = clubsService;
        this.shipmentsService = shipmentsService;
        this.riderProfileService = riderProfileService;
    }
    async create(dto) {
        return this.clubsService.create(dto);
    }
    async findAll(search, category, minRating, minReviews) {
        const categoryIds = category
            ? category.split(',').map((c) => Number(c)).filter((n) => !Number.isNaN(n))
            : undefined;
        return this.clubsService.findAll({
            search,
            categoryIds,
            minRating: minRating ? Number(minRating) : undefined,
            minReviews: minReviews ? Number(minReviews) : undefined,
        });
    }
    async findFeatured() {
        return this.clubsService.findFeatured();
    }
    async findOne(id, req) {
        return this.clubsService.findOne(id, req.user?.id);
    }
    async getClubSubscriptions(id, req) {
        return this.clubsService.findSubscriptionsByClub(id, req.user.id);
    }
    async getClubCustomers(id, req) {
        return this.clubsService.findCustomersByClub(id, req.user.id);
    }
    async getClubDeliveries(id, req) {
        await this.clubsService.assertOwnership(id, req.user.id);
        return this.shipmentsService.findByClub(id);
    }
    async getClubRiders(id, req) {
        await this.clubsService.assertOwnership(id, req.user.id);
        return this.riderProfileService.findByClub(id);
    }
    async assignDelivery(id, shipmentId, dto, req) {
        await this.clubsService.assertOwnership(id, req.user.id);
        return this.shipmentsService.assignRiderForClub(shipmentId, id, dto);
    }
    async update(id, dto, req) {
        return this.clubsService.update(id, dto, req.user.id);
    }
    async updateLogo(id, file, req) {
        return this.clubsService.updateLogo(id, file, req.user.id);
    }
    async remove(id) {
        return this.clubsService.remove(id);
    }
};
exports.ClubsController = ClubsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_club_dto_1.CreateClubDto]),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('minRating')),
    __param(3, (0, common_1.Query)('minReviews')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "findFeatured", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur'),
    (0, common_1.Get)(':id/user-subscriptions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "getClubSubscriptions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur'),
    (0, common_1.Get)(':id/customers'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "getClubCustomers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur'),
    (0, common_1.Get)(':id/deliveries'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "getClubDeliveries", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur'),
    (0, common_1.Get)(':id/riders'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "getClubRiders", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur'),
    (0, common_1.Put)(':id/deliveries/:shipmentId'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('shipmentId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, assign_delivery_dto_1.AssignDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "assignDelivery", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_club_dto_1.UpdateClubDto, Object]),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur'),
    (0, common_1.Patch)(':id/logo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "updateLogo", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClubsController.prototype, "remove", null);
exports.ClubsController = ClubsController = __decorate([
    (0, common_1.Controller)('clubs'),
    __metadata("design:paramtypes", [clubs_service_1.ClubsService,
        shipments_service_1.ShipmentsService,
        rider_profile_service_1.RiderProfileService])
], ClubsController);
//# sourceMappingURL=clubs.controller.js.map