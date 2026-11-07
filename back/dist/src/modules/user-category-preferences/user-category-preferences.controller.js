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
exports.UserCategoryPreferencesController = void 0;
const common_1 = require("@nestjs/common");
const user_category_preferences_service_1 = require("./user-category-preferences.service");
const set_user_category_preferences_dto_1 = require("./dto/set-user-category-preferences.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let UserCategoryPreferencesController = class UserCategoryPreferencesController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async getMine(req) {
        return this.svc.findByUser(req.user.id);
    }
    async setMine(dto, req) {
        return this.svc.replace(req.user.id, dto.categoryIds);
    }
};
exports.UserCategoryPreferencesController = UserCategoryPreferencesController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserCategoryPreferencesController.prototype, "getMine", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [set_user_category_preferences_dto_1.SetUserCategoryPreferencesDto, Object]),
    __metadata("design:returntype", Promise)
], UserCategoryPreferencesController.prototype, "setMine", null);
exports.UserCategoryPreferencesController = UserCategoryPreferencesController = __decorate([
    (0, common_1.Controller)('user-category-preferences'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    __metadata("design:paramtypes", [user_category_preferences_service_1.UserCategoryPreferencesService])
], UserCategoryPreferencesController);
//# sourceMappingURL=user-category-preferences.controller.js.map