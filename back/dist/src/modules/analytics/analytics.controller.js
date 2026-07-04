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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getClubStats(idClub) {
        return this.analyticsService.getClubStats(idClub);
    }
    async getSalesReport(idClub, from, to, idSubscriptionTypes, paymentStatus, idPaymentMethods, page, pageSize) {
        return this.analyticsService.getSalesReport(idClub, {
            from,
            to,
            idSubscriptionTypes: idSubscriptionTypes ? Number(idSubscriptionTypes) : undefined,
            paymentStatus,
            idPaymentMethods: idPaymentMethods ? Number(idPaymentMethods) : undefined,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 20,
        });
    }
    async getSalesReportExport(idClub, from, to, idSubscriptionTypes, paymentStatus, idPaymentMethods) {
        return this.analyticsService.getSalesReportExport(idClub, {
            from,
            to,
            idSubscriptionTypes: idSubscriptionTypes ? Number(idSubscriptionTypes) : undefined,
            paymentStatus,
            idPaymentMethods: idPaymentMethods ? Number(idPaymentMethods) : undefined,
        });
    }
    async getFeedbackTrends(idClub) {
        return this.analyticsService.getFeedbackTrends(idClub);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('club-stats/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getClubStats", null);
__decorate([
    (0, common_1.Get)('sales-report/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('idSubscriptionTypes')),
    __param(4, (0, common_1.Query)('paymentStatus')),
    __param(5, (0, common_1.Query)('idPaymentMethods')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Get)('sales-report-export/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('idSubscriptionTypes')),
    __param(4, (0, common_1.Query)('paymentStatus')),
    __param(5, (0, common_1.Query)('idPaymentMethods')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSalesReportExport", null);
__decorate([
    (0, common_1.Get)('feedback-trends/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getFeedbackTrends", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map