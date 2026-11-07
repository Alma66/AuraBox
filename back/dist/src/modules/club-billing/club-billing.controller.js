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
exports.ClubBillingController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const club_billing_service_1 = require("./club-billing.service");
const update_club_billing_dto_1 = require("./dto/update-club-billing.dto");
let ClubBillingController = class ClubBillingController {
    service;
    constructor(service) {
        this.service = service;
    }
    async get(id, req) {
        return this.service.get(id, req.user);
    }
    async update(id, dto, req) {
        return this.service.update(id, dto, req.user);
    }
};
exports.ClubBillingController = ClubBillingController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ClubBillingController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_club_billing_dto_1.UpdateClubBillingDto, Object]),
    __metadata("design:returntype", Promise)
], ClubBillingController.prototype, "update", null);
exports.ClubBillingController = ClubBillingController = __decorate([
    (0, common_1.Controller)('clubs/:id/billing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    __metadata("design:paramtypes", [club_billing_service_1.ClubBillingService])
], ClubBillingController);
//# sourceMappingURL=club-billing.controller.js.map