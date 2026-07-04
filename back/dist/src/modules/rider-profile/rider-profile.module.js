"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiderProfileModule = void 0;
const common_1 = require("@nestjs/common");
const rider_profile_service_1 = require("./rider-profile.service");
const rider_profile_controller_1 = require("./rider-profile.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let RiderProfileModule = class RiderProfileModule {
};
exports.RiderProfileModule = RiderProfileModule;
exports.RiderProfileModule = RiderProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [rider_profile_controller_1.RiderProfileController],
        providers: [rider_profile_service_1.RiderProfileService],
        exports: [rider_profile_service_1.RiderProfileService],
    })
], RiderProfileModule);
//# sourceMappingURL=rider-profile.module.js.map