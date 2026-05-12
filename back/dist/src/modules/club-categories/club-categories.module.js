"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubCategoriesModule = void 0;
const common_1 = require("@nestjs/common");
const club_categories_service_1 = require("./club-categories.service");
const club_categories_controller_1 = require("./club-categories.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let ClubCategoriesModule = class ClubCategoriesModule {
};
exports.ClubCategoriesModule = ClubCategoriesModule;
exports.ClubCategoriesModule = ClubCategoriesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [club_categories_controller_1.ClubCategoriesController],
        providers: [club_categories_service_1.ClubCategoriesService],
    })
], ClubCategoriesModule);
//# sourceMappingURL=club-categories.module.js.map