"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubStatusHistoryModule = void 0;
const common_1 = require("@nestjs/common");
const club_status_history_service_1 = require("./club-status-history.service");
const club_status_history_controller_1 = require("./club-status-history.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let ClubStatusHistoryModule = class ClubStatusHistoryModule {
};
exports.ClubStatusHistoryModule = ClubStatusHistoryModule;
exports.ClubStatusHistoryModule = ClubStatusHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [club_status_history_controller_1.ClubStatusHistoryController],
        providers: [club_status_history_service_1.ClubStatusHistoryService],
    })
], ClubStatusHistoryModule);
//# sourceMappingURL=club-status-history.module.js.map