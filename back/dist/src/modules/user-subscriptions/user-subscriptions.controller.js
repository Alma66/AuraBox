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
exports.UserSubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const user_subscriptions_service_1 = require("./user-subscriptions.service");
const create_user_subscription_dto_1 = require("./dto/create-user-subscription.dto");
const update_user_subscription_dto_1 = require("./dto/update-user-subscription.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let UserSubscriptionsController = class UserSubscriptionsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async create(dto, req) {
        return this.svc.create(dto, req.user?.id);
    }
    async findAll(userId) {
        if (userId)
            return this.svc.findByUser(Number(userId));
        return this.svc.findAll();
    }
    async findOne(id) {
        return this.svc.findById(id);
    }
    async update(id, dto, req) {
        return this.svc.update(id, dto, req.user?.role);
    }
    async cancel(id, body, req) {
        const sub = await this.svc.findById(id);
        if (req.user?.id !== sub.idUser && req.user?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('No autorizado para cancelar esta suscripción');
        }
        return this.svc.cancel(id, body?.reason);
    }
    async remove(id) {
        return this.svc.remove(id);
    }
};
exports.UserSubscriptionsController = UserSubscriptionsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_subscription_dto_1.CreateUserSubscriptionDto, Object]),
    __metadata("design:returntype", Promise)
], UserSubscriptionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserSubscriptionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserSubscriptionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'OWNER'),
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_subscription_dto_1.UpdateUserSubscriptionDto, Object]),
    __metadata("design:returntype", Promise)
], UserSubscriptionsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], UserSubscriptionsController.prototype, "cancel", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserSubscriptionsController.prototype, "remove", null);
exports.UserSubscriptionsController = UserSubscriptionsController = __decorate([
    (0, common_1.Controller)('user-subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_subscriptions_service_1.UserSubscriptionsService])
], UserSubscriptionsController);
//# sourceMappingURL=user-subscriptions.controller.js.map