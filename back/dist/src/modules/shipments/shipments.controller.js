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
exports.ShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const shipments_service_1 = require("./shipments.service");
const create_shipment_dto_1 = require("./dto/create-shipment.dto");
const update_shipment_dto_1 = require("./dto/update-shipment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ShipmentsController = class ShipmentsController {
    shipmentsService;
    constructor(shipmentsService) {
        this.shipmentsService = shipmentsService;
    }
    async create(dto, req) {
        if (req.user.id !== dto.idUser && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('No autorizado para crear este envío');
        }
        return this.shipmentsService.create(dto);
    }
    async findAll() {
        return this.shipmentsService.findAll();
    }
    async findByUser(idUser, req) {
        if (req.user.id !== idUser && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('No autorizado para ver estos envíos');
        }
        return this.shipmentsService.findByUser(idUser);
    }
    async findByClub(idClub) {
        return this.shipmentsService.findByClub(idClub);
    }
    async findOne(id, req) {
        const shipment = await this.shipmentsService.findOne(id);
        if (req.user.role !== 'ADMIN' && req.user.id !== shipment.idUser) {
            throw new common_1.ForbiddenException('No autorizado para ver este envío');
        }
        return shipment;
    }
    async update(id, dto) {
        return this.shipmentsService.update(id, dto);
    }
    async remove(id) {
        return this.shipmentsService.remove(id);
    }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shipment_dto_1.CreateShipmentDto, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-user/:idUser'),
    __param(0, (0, common_1.Param)('idUser', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, common_1.Get)('by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findByClub", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_shipment_dto_1.UpdateShipmentDto]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "remove", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, common_1.Controller)('shipments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map