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
exports.ClubSocialNetworksController = void 0;
const common_1 = require("@nestjs/common");
const club_social_networks_service_1 = require("./club-social-networks.service");
const create_club_social_network_dto_1 = require("./dto/create-club-social-network.dto");
const update_club_social_network_dto_1 = require("./dto/update-club-social-network.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ClubSocialNetworksController = class ClubSocialNetworksController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async create(dto) {
        return this.svc.create(dto);
    }
    async findAll() {
        return this.svc.findAll();
    }
    async findByClub(idClub) {
        return this.svc.findByClub(idClub);
    }
    async findOne(id) {
        return this.svc.findOne(id);
    }
    async update(id, dto) {
        return this.svc.update(id, dto);
    }
    async remove(id) {
        return this.svc.remove(id);
    }
};
exports.ClubSocialNetworksController = ClubSocialNetworksController;
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_club_social_network_dto_1.CreateClubSocialNetworkDto]),
    __metadata("design:returntype", Promise)
], ClubSocialNetworksController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClubSocialNetworksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClubSocialNetworksController.prototype, "findByClub", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClubSocialNetworksController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_club_social_network_dto_1.UpdateClubSocialNetworkDto]),
    __metadata("design:returntype", Promise)
], ClubSocialNetworksController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClubSocialNetworksController.prototype, "remove", null);
exports.ClubSocialNetworksController = ClubSocialNetworksController = __decorate([
    (0, common_1.Controller)('club-social-networks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [club_social_networks_service_1.ClubSocialNetworksService])
], ClubSocialNetworksController);
//# sourceMappingURL=club-social-networks.controller.js.map