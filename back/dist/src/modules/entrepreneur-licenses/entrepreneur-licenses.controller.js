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
exports.EntrepreneurLicensesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const entrepreneur_licenses_service_1 = require("./entrepreneur-licenses.service");
const create_entrepreneur_licenses_dto_1 = require("./dto/create-entrepreneur-licenses.dto");
const update_entrepreneur_licenses_dto_1 = require("./dto/update-entrepreneur-licenses.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let EntrepreneurLicensesController = class EntrepreneurLicensesController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto, req, document) {
        if (req.user.role !== 'ADMIN' && req.user.id !== dto.idEntrepreneurs) {
            throw new common_1.ForbiddenException('No autorizado para crear esta licencia');
        }
        return this.service.create(dto, document);
    }
    async findAll() {
        return this.service.findAll();
    }
    async findByEntrepreneur(idEntrepreneur, req) {
        if (req.user.id !== idEntrepreneur && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('No autorizado para ver estas licencias');
        }
        return this.service.findByEntrepreneur(idEntrepreneur);
    }
    async findOne(id, req) {
        const item = await this.service.findOne(id);
        if (req.user.id !== item.idEntrepreneurs && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('No autorizado para ver esta licencia');
        }
        return item;
    }
    async update(id, dto, req) {
        const existing = await this.service.findOne(id);
        if (req.user.id !== existing.idEntrepreneurs && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('No autorizado para actualizar esta licencia');
        }
        return this.service.update(id, dto);
    }
    async verify(id, body) {
        return this.service.verify(id, body.verificationStatus, body.verificationNotes);
    }
    async remove(id) {
        return this.service.remove(id);
    }
};
exports.EntrepreneurLicensesController = EntrepreneurLicensesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(pdf|jpg|jpeg|png)$/)) {
                callback(new Error('Solo se permiten PDF o imágenes'), false);
            }
            else {
                callback(null, true);
            }
        },
    })),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_entrepreneur_licenses_dto_1.CreateEntrepreneurLicenseDto, Object, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurLicensesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EntrepreneurLicensesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-entrepreneur/:idEntrepreneur'),
    __param(0, (0, common_1.Param)('idEntrepreneur', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurLicensesController.prototype, "findByEntrepreneur", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurLicensesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_entrepreneur_licenses_dto_1.UpdateEntrepreneurLicenseDto, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurLicensesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Put)(':id/verify'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurLicensesController.prototype, "verify", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EntrepreneurLicensesController.prototype, "remove", null);
exports.EntrepreneurLicensesController = EntrepreneurLicensesController = __decorate([
    (0, common_1.Controller)('entrepreneur-licenses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [entrepreneur_licenses_service_1.EntrepreneurLicensesService])
], EntrepreneurLicensesController);
//# sourceMappingURL=entrepreneur-licenses.controller.js.map