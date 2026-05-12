"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageClubModule = void 0;
const common_1 = require("@nestjs/common");
const image_club_service_1 = require("./image-club.service");
const image_club_controller_1 = require("./image-club.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let ImageClubModule = class ImageClubModule {
};
exports.ImageClubModule = ImageClubModule;
exports.ImageClubModule = ImageClubModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [image_club_controller_1.ImageClubController],
        providers: [image_club_service_1.ImageClubService],
    })
], ImageClubModule);
//# sourceMappingURL=image-club.module.js.map