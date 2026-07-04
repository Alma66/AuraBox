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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClubStatusHistoryDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateClubStatusHistoryDto {
    idClub;
    idAdmins;
    previousStatus;
    newStatus;
    changeDate;
    changeReason;
}
exports.CreateClubStatusHistoryDto = CreateClubStatusHistoryDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateClubStatusHistoryDto.prototype, "idClub", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateClubStatusHistoryDto.prototype, "idAdmins", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ClubStatus),
    __metadata("design:type", String)
], CreateClubStatusHistoryDto.prototype, "previousStatus", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ClubStatus),
    __metadata("design:type", String)
], CreateClubStatusHistoryDto.prototype, "newStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClubStatusHistoryDto.prototype, "changeDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClubStatusHistoryDto.prototype, "changeReason", void 0);
//# sourceMappingURL=create-club-status-history.dto.js.map