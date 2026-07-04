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
exports.AdminOrEntrepreneurRoleController = void 0;
const common_1 = require("@nestjs/common");
const admin_or_entrepreneur_role_service_1 = require("./admin-or-entrepreneur-role.service");
const create_admin_or_entrepreneur_role_dto_1 = require("./dto/create-admin-or-entrepreneur-role.dto");
const update_admin_or_entrepreneur_role_dto_1 = require("./dto/update-admin-or-entrepreneur-role.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let AdminOrEntrepreneurRoleController = class AdminOrEntrepreneurRoleController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async create(dto) {
        return this.svc.create(dto);
    }
    async findAll() {
        return this.svc.findAll();
    }
    async findByAssignedTo(assignedTo) {
        return this.svc.findByAssignedTo(assignedTo);
    }
    async findByRole(idRole) {
        return this.svc.findByRole(idRole);
    }
    async findOne(id) {
        return this.svc.findOne(id);
    }
    async update(id, dto) {
        return this.svc.update(id, dto);
    }
    async remove(id) {
        return this.svc.remove(id);
    }
};
exports.AdminOrEntrepreneurRoleController = AdminOrEntrepreneurRoleController;
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_or_entrepreneur_role_dto_1.CreateAdminOrEntrepreneurRoleDto]),
    __metadata("design:returntype", Promise)
], AdminOrEntrepreneurRoleController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminOrEntrepreneurRoleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-assigned-to/:assignedTo'),
    __param(0, (0, common_1.Param)('assignedTo', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminOrEntrepreneurRoleController.prototype, "findByAssignedTo", null);
__decorate([
    (0, common_1.Get)('by-role/:idRole'),
    __param(0, (0, common_1.Param)('idRole', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminOrEntrepreneurRoleController.prototype, "findByRole", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminOrEntrepreneurRoleController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_admin_or_entrepreneur_role_dto_1.UpdateAdminOrEntrepreneurRoleDto]),
    __metadata("design:returntype", Promise)
], AdminOrEntrepreneurRoleController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminOrEntrepreneurRoleController.prototype, "remove", null);
exports.AdminOrEntrepreneurRoleController = AdminOrEntrepreneurRoleController = __decorate([
    (0, common_1.Controller)('admin-or-entrepreneur-role'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [admin_or_entrepreneur_role_service_1.AdminOrEntrepreneurRoleService])
], AdminOrEntrepreneurRoleController);
//# sourceMappingURL=admin-or-entrepreneur-role.controller.js.map