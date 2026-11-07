"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCategoryPreferencesModule = void 0;
const common_1 = require("@nestjs/common");
const user_category_preferences_service_1 = require("./user-category-preferences.service");
const user_category_preferences_controller_1 = require("./user-category-preferences.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let UserCategoryPreferencesModule = class UserCategoryPreferencesModule {
};
exports.UserCategoryPreferencesModule = UserCategoryPreferencesModule;
exports.UserCategoryPreferencesModule = UserCategoryPreferencesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [user_category_preferences_controller_1.UserCategoryPreferencesController],
        providers: [user_category_preferences_service_1.UserCategoryPreferencesService],
    })
], UserCategoryPreferencesModule);
//# sourceMappingURL=user-category-preferences.module.js.map