"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserClubPreferencesModule = void 0;
const common_1 = require("@nestjs/common");
const user_club_preferences_service_1 = require("./user-club-preferences.service");
const user_club_preferences_controller_1 = require("./user-club-preferences.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let UserClubPreferencesModule = class UserClubPreferencesModule {
};
exports.UserClubPreferencesModule = UserClubPreferencesModule;
exports.UserClubPreferencesModule = UserClubPreferencesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [user_club_preferences_controller_1.UserClubPreferencesController],
        providers: [user_club_preferences_service_1.UserClubPreferencesService],
    })
], UserClubPreferencesModule);
//# sourceMappingURL=user-club-preferences.module.js.map