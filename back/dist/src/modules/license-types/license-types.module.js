"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseTypesModule = void 0;
const common_1 = require("@nestjs/common");
const license_types_service_1 = require("./license-types.service");
const license_types_controller_1 = require("./license-types.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let LicenseTypesModule = class LicenseTypesModule {
};
exports.LicenseTypesModule = LicenseTypesModule;
exports.LicenseTypesModule = LicenseTypesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [license_types_controller_1.LicenseTypesController],
        providers: [license_types_service_1.LicenseTypesService],
    })
], LicenseTypesModule);
//# sourceMappingURL=license-types.module.js.map