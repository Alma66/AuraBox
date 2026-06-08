"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxContentHistoryModule = void 0;
const common_1 = require("@nestjs/common");
const box_content_history_service_1 = require("./box-content-history.service");
const box_content_history_controller_1 = require("./box-content-history.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
let BoxContentHistoryModule = class BoxContentHistoryModule {
};
exports.BoxContentHistoryModule = BoxContentHistoryModule;
exports.BoxContentHistoryModule = BoxContentHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, cloudinary_module_1.CloudinaryModule],
        controllers: [box_content_history_controller_1.BoxContentHistoryController],
        providers: [box_content_history_service_1.BoxContentHistoryService],
    })
], BoxContentHistoryModule);
//# sourceMappingURL=box-content-history.module.js.map