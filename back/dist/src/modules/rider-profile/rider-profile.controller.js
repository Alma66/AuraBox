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
exports.RiderProfileController = void 0;
const common_1 = require("@nestjs/common");
const rider_profile_service_1 = require("./rider-profile.service");
const create_rider_profile_dto_1 = require("./dto/create-rider-profile.dto");
const update_rider_profile_dto_1 = require("./dto/update-rider-profile.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let RiderProfileController = class RiderProfileController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async create(dto, req) {
        if (req.user.role !== 'admin' && req.user.id !== dto.idEntrepreneur) {
            throw new common_1.ForbiddenException('No autorizado para crear este perfil');
        }
        return this.svc.create(dto);
    }
    async findAll() {
        return this.svc.findAll();
    }
    async findByClub(idClub) {
        return this.svc.findByClub(idClub);
    }
    async findByEntrepreneur(idEntrepreneur, req) {
        if (req.user.role !== 'admin' && req.user.id !== idEntrepreneur) {
            throw new common_1.ForbiddenException('No autorizado para ver este perfil');
        }
        return this.svc.findByEntrepreneur(idEntrepreneur);
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
exports.RiderProfileController = RiderProfileController;
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_rider_profile_dto_1.CreateRiderProfileDto, Object]),
    __metadata("design:returntype", Promise)
], RiderProfileController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RiderProfileController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RiderProfileController.prototype, "findByClub", null);
__decorate([
    (0, common_1.Get)('by-entrepreneur/:idEntrepreneur'),
    __param(0, (0, common_1.Param)('idEntrepreneur', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RiderProfileController.prototype, "findByEntrepreneur", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RiderProfileController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_rider_profile_dto_1.UpdateRiderProfileDto]),
    __metadata("design:returntype", Promise)
], RiderProfileController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RiderProfileController.prototype, "remove", null);
exports.RiderProfileController = RiderProfileController = __decorate([
    (0, common_1.Controller)('rider-profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [rider_profile_service_1.RiderProfileService])
], RiderProfileController);
//# sourceMappingURL=rider-profile.controller.js.map