"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubSocialNetworksModule = void 0;
const common_1 = require("@nestjs/common");
const club_social_networks_service_1 = require("./club-social-networks.service");
const club_social_networks_controller_1 = require("./club-social-networks.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let ClubSocialNetworksModule = class ClubSocialNetworksModule {
};
exports.ClubSocialNetworksModule = ClubSocialNetworksModule;
exports.ClubSocialNetworksModule = ClubSocialNetworksModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [club_social_networks_controller_1.ClubSocialNetworksController],
        providers: [club_social_networks_service_1.ClubSocialNetworksService],
    })
], ClubSocialNetworksModule);
//# sourceMappingURL=club-social-networks.module.js.map