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
exports.PlatformRulesController = void 0;
const common_1 = require("@nestjs/common");
const platform_rules_service_1 = require("./platform-rules.service");
const create_platform_rule_dto_1 = require("./dto/create-platform-rule.dto");
const update_platform_rule_dto_1 = require("./dto/update-platform-rule.dto");
const set_rule_active_dto_1 = require("./dto/set-rule-active.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let PlatformRulesController = class PlatformRulesController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async findActive() {
        return this.svc.findActive();
    }
    async findRequiredForSignup(audience) {
        return this.svc.findRequiredForSignup(audience);
    }
    async create(dto) {
        return this.svc.create(dto);
    }
    async findAll() {
        return this.svc.findAll();
    }
    async findOne(id) {
        return this.svc.findOne(id);
    }
    async update(id, dto) {
        return this.svc.update(id, dto);
    }
    async setActive(id, dto) {
        return this.svc.setActive(id, dto.active);
    }
    async remove(id) {
        return this.svc.remove(id);
    }
};
exports.PlatformRulesController = PlatformRulesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformRulesController.prototype, "findActive", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('required/:audience'),
    __param(0, (0, common_1.Param)('audience')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformRulesController.prototype, "findRequiredForSignup", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_platform_rule_dto_1.CreatePlatformRuleDto]),
    __metadata("design:returntype", Promise)
], PlatformRulesController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformRulesController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PlatformRulesController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_platform_rule_dto_1.UpdatePlatformRuleDto]),
    __metadata("design:returntype", Promise)
], PlatformRulesController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Patch)(':id/active'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, set_rule_active_dto_1.SetRuleActiveDto]),
    __metadata("design:returntype", Promise)
], PlatformRulesController.prototype, "setActive", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PlatformRulesController.prototype, "remove", null);
exports.PlatformRulesController = PlatformRulesController = __decorate([
    (0, common_1.Controller)('platform-rules'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __metadata("design:paramtypes", [platform_rules_service_1.PlatformRulesService])
], PlatformRulesController);
//# sourceMappingURL=platform-rules.controller.js.map