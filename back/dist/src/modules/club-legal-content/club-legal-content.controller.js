"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubLegalContentController = void 0;
const common_1 = require("@nestjs/common");
const club_legal_content_service_1 = require("./club-legal-content.service");
const update_club_legal_content_dto_1 = require("./dto/update-club-legal-content.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let ClubLegalContentController = class ClubLegalContentController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findByClub(idClub, req) {
        return this.service.findByClub(idClub, req.user);
    }
    async upsert(idClub, dto, req) {
        return this.service.upsert(idClub, dto, req.user.id);
    }
};
exports.ClubLegalContentController = ClubLegalContentController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ClubLegalContentController.prototype, "findByClub", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur'),
    (0, common_1.Put)('by-club/:idClub'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_club_legal_content_dto_1.UpdateClubLegalContentDto, Object]),
    __metadata("design:returntype", Promise)
], ClubLegalContentController.prototype, "upsert", null);
exports.ClubLegalContentController = ClubLegalContentController = __decorate([
    (0, common_1.Controller)('club-legal-content'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [club_legal_content_service_1.ClubLegalContentService])
], ClubLegalContentController);
//# sourceMappingURL=club-legal-content.controller.js.map