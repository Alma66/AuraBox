"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformRulesModule = void 0;
const common_1 = require("@nestjs/common");
const platform_rules_service_1 = require("./platform-rules.service");
const platform_rules_controller_1 = require("./platform-rules.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let PlatformRulesModule = class PlatformRulesModule {
};
exports.PlatformRulesModule = PlatformRulesModule;
exports.PlatformRulesModule = PlatformRulesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [platform_rules_controller_1.PlatformRulesController],
        providers: [platform_rules_service_1.PlatformRulesService],
    })
], PlatformRulesModule);
//# sourceMappingURL=platform-rules.module.js.map