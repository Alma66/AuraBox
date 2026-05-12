"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubPaymentMethodModule = void 0;
const common_1 = require("@nestjs/common");
const club_payment_method_service_1 = require("./club-payment-method.service");
const club_payment_method_controller_1 = require("./club-payment-method.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let ClubPaymentMethodModule = class ClubPaymentMethodModule {
};
exports.ClubPaymentMethodModule = ClubPaymentMethodModule;
exports.ClubPaymentMethodModule = ClubPaymentMethodModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [club_payment_method_controller_1.ClubPaymentMethodController],
        providers: [club_payment_method_service_1.ClubPaymentMethodService],
    })
], ClubPaymentMethodModule);
//# sourceMappingURL=club-payment-method.module.js.map