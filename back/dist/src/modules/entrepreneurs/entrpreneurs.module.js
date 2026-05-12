"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntrepreneursModule = void 0;
const common_1 = require("@nestjs/common");
const entrepreneurs_service_1 = require("./entrepreneurs.service");
const entrepreneurs_controller_1 = require("./entrepreneurs.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let EntrepreneursModule = class EntrepreneursModule {
};
exports.EntrepreneursModule = EntrepreneursModule;
exports.EntrepreneursModule = EntrepreneursModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [entrepreneurs_controller_1.EntrepreneursController],
        providers: [entrepreneurs_service_1.EntrepreneursService],
    })
], EntrepreneursModule);
//# sourceMappingURL=entrpreneurs.module.js.map