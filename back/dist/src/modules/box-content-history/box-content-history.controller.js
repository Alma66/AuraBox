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
exports.BoxContentHistoryController = void 0;
const common_1 = require("@nestjs/common");
const box_content_history_service_1 = require("./box-content-history.service");
const create_box_content_history_dto_1 = require("./dto/create-box-content-history.dto");
const update_box_content_history_dto_1 = require("./dto/update-box-content-history.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let BoxContentHistoryController = class BoxContentHistoryController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async create(dto, req) {
        return this.svc.create(dto);
    }
    async findAll(page, perPage) {
        const p = page ? parseInt(page, 10) : 1;
        const pp = perPage ? parseInt(perPage, 10) : 50;
        return this.svc.findAll(p, pp);
    }
    async findBySubscriptionType(idSubscriptionTypes) {
        return this.svc.findBySubscriptionType(idSubscriptionTypes);
    }
    async findByDeliveryMonth(deliveryMonthYear) {
        return this.svc.findByDeliveryMonth(deliveryMonthYear);
    }
    async findOne(id) {
        return this.svc.findOne(id);
    }
    async update(id, dto, req) {
        return this.svc.update(id, dto);
    }
    async remove(id, req) {
        return this.svc.remove(id);
    }
};
exports.BoxContentHistoryController = BoxContentHistoryController;
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_box_content_history_dto_1.CreateBoxContentHistoryDto, Object]),
    __metadata("design:returntype", Promise)
], BoxContentHistoryController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('perPage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BoxContentHistoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-subscription-type/:idSubscriptionTypes'),
    __param(0, (0, common_1.Param)('idSubscriptionTypes', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BoxContentHistoryController.prototype, "findBySubscriptionType", null);
__decorate([
    (0, common_1.Get)('by-delivery-month/:deliveryMonthYear'),
    __param(0, (0, common_1.Param)('deliveryMonthYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BoxContentHistoryController.prototype, "findByDeliveryMonth", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BoxContentHistoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_box_content_history_dto_1.UpdateBoxContentHistoryDto, Object]),
    __metadata("design:returntype", Promise)
], BoxContentHistoryController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BoxContentHistoryController.prototype, "remove", null);
exports.BoxContentHistoryController = BoxContentHistoryController = __decorate([
    (0, common_1.Controller)('box-content-history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [box_content_history_service_1.BoxContentHistoryService])
], BoxContentHistoryController);
//# sourceMappingURL=box-content-history.controller.js.map