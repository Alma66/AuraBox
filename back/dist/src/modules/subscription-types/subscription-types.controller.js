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
exports.SubscriptionTypesController = void 0;
const common_1 = require("@nestjs/common");
const subscription_types_service_1 = require("./subscription-types.service");
const create_subscription_types_dto_1 = require("./dto/create-subscription-types.dto");
const update_subscription_types_dto_1 = require("./dto/update-subscription-types.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let SubscriptionTypesController = class SubscriptionTypesController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async findAll(clubId) {
        if (clubId) {
            return this.svc.findByClub(Number(clubId));
        }
        return this.svc.findAll();
    }
    async findOne(id) {
        return this.svc.findById(id);
    }
    async create(dto, req) {
        return this.svc.create(dto);
    }
    async update(id, dto, req) {
        return this.svc.update(id, dto, req.user?.role);
    }
    async remove(id) {
        return this.svc.remove(id);
    }
};
exports.SubscriptionTypesController = SubscriptionTypesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('clubId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubscriptionTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subscription_types_dto_1.CreateSubscriptionTypeDto, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionTypesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_subscription_types_dto_1.UpdateSubscriptionTypeDto, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionTypesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubscriptionTypesController.prototype, "remove", null);
exports.SubscriptionTypesController = SubscriptionTypesController = __decorate([
    (0, common_1.Controller)('subscription-types'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [subscription_types_service_1.SubscriptionTypesService])
], SubscriptionTypesController);
//# sourceMappingURL=subscription-types.controller.js.map