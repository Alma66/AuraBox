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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const finance_service_1 = require("./finance.service");
const create_financial_entry_dto_1 = require("./dto/create-financial-entry.dto");
const update_financial_entry_dto_1 = require("./dto/update-financial-entry.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let FinanceController = class FinanceController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async getMovements(idClub) {
        return this.svc.getMovements(idClub);
    }
    async getProfitability(idClub) {
        return this.svc.getProfitability(idClub);
    }
    async createEntry(dto) {
        return this.svc.createEntry(dto);
    }
    async updateEntry(id, dto) {
        return this.svc.updateEntry(id, dto);
    }
    async removeEntry(id) {
        return this.svc.removeEntry(id);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)('movements/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Get)('profitability/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getProfitability", null);
__decorate([
    (0, common_1.Post)('entries'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_financial_entry_dto_1.CreateFinancialEntryDto]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "createEntry", null);
__decorate([
    (0, common_1.Put)('entries/:id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_financial_entry_dto_1.UpdateFinancialEntryDto]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "updateEntry", null);
__decorate([
    (0, common_1.Delete)('entries/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "removeEntry", null);
exports.FinanceController = FinanceController = __decorate([
    (0, common_1.Controller)('finance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map