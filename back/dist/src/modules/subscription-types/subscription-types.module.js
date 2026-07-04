"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionTypesModule = void 0;
const common_1 = require("@nestjs/common");
const subscription_types_service_1 = require("./subscription-types.service");
const subscription_types_controller_1 = require("./subscription-types.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
let SubscriptionTypesModule = class SubscriptionTypesModule {
};
exports.SubscriptionTypesModule = SubscriptionTypesModule;
exports.SubscriptionTypesModule = SubscriptionTypesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, cloudinary_module_1.CloudinaryModule],
        controllers: [subscription_types_controller_1.SubscriptionTypesController],
        providers: [subscription_types_service_1.SubscriptionTypesService],
        exports: [subscription_types_service_1.SubscriptionTypesService],
    })
], SubscriptionTypesModule);
//# sourceMappingURL=subscription-types.module.js.map