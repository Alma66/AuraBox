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
exports.CourierController = void 0;
const common_1 = require("@nestjs/common");
const courier_service_1 = require("./courier.service");
const set_club_couriers_dto_1 = require("./dto/set-club-couriers.dto");
const set_courier_fee_dto_1 = require("./dto/set-courier-fee.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let CourierController = class CourierController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async findAll() {
        return this.svc.findAll();
    }
    async findByClub(idClub) {
        return this.svc.findByClub(idClub);
    }
    async setClubCouriers(idClub, dto) {
        return this.svc.setClubCouriers(idClub, dto);
    }
    async setCourierFee(idClub, idCourier, dto) {
        return this.svc.setCourierFee(idClub, idCourier, dto);
    }
};
exports.CourierController = CourierController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "findByClub", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Put)('by-club/:idClub'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, set_club_couriers_dto_1.SetClubCouriersDto]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "setClubCouriers", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Put)('by-club/:idClub/fee/:idCourier'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('idCourier', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, set_courier_fee_dto_1.SetCourierFeeDto]),
    __metadata("design:returntype", Promise)
], CourierController.prototype, "setCourierFee", null);
exports.CourierController = CourierController = __decorate([
    (0, common_1.Controller)('courier'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [courier_service_1.CourierService])
], CourierController);
//# sourceMappingURL=courier.controller.js.map