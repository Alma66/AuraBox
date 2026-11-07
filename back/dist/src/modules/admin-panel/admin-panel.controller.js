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
exports.AdminPanelController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const admin_panel_service_1 = require("./admin-panel.service");
const change_club_status_dto_1 = require("./dto/change-club-status.dto");
const set_active_dto_1 = require("./dto/set-active.dto");
const set_review_visibility_dto_1 = require("./dto/set-review-visibility.dto");
let AdminPanelController = class AdminPanelController {
    service;
    constructor(service) {
        this.service = service;
    }
    async getStats() {
        return this.service.getStats();
    }
    async findClubs(status) {
        return this.service.findClubs(status);
    }
    async findClubStatusHistory(id) {
        return this.service.findClubStatusHistory(id);
    }
    async changeClubStatus(id, dto, req) {
        return this.service.changeClubStatus(id, req.user.id, dto);
    }
    async findAccounts(type, search) {
        return this.service.findAccounts(type, search);
    }
    async setAccountActive(type, id, dto) {
        return this.service.setAccountActive(type, id, dto.active);
    }
    async findPayments(clubId, month) {
        return this.service.findPayments(clubId, month);
    }
    async findReviews(filter) {
        return this.service.findReviews(filter);
    }
    async setReviewVisibility(id, dto) {
        return this.service.setReviewVisibility(id, dto);
    }
};
exports.AdminPanelController = AdminPanelController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminPanelController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('clubs'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminPanelController.prototype, "findClubs", null);
__decorate([
    (0, common_1.Get)('clubs/:id/status-history'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminPanelController.prototype, "findClubStatusHistory", null);
__decorate([
    (0, common_1.Patch)('clubs/:id/status'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, change_club_status_dto_1.ChangeClubStatusDto, Object]),
    __metadata("design:returntype", Promise)
], AdminPanelController.prototype, "changeClubStatus", null);
__decorate([
    (0, common_1.Get)('accounts'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminPanelController.prototype, "findAccounts", null);
__decorate([
    (0, common_1.Patch)('accounts/:type/:id/active'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, set_active_dto_1.SetActiveDto]),
    __metadata("design:returntype", Promise)
], AdminPanelController.prototype, "setAccountActive", null);
__decorate([
    (0, common_1.Get)('payments'),
    __param(0, (0, common_1.Query)('clubId')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminPanelController.prototype, "findPayments", null);
__decorate([
    (0, common_1.Get)('reviews'),
    __param(0, (0, common_1.Query)('filter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminPanelController.prototype, "findReviews", null);
__decorate([
    (0, common_1.Patch)('reviews/:id/visibility'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, set_review_visibility_dto_1.SetReviewVisibilityDto]),
    __metadata("design:returntype", Promise)
], AdminPanelController.prototype, "setReviewVisibility", null);
exports.AdminPanelController = AdminPanelController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [admin_panel_service_1.AdminPanelService])
], AdminPanelController);
//# sourceMappingURL=admin-panel.controller.js.map