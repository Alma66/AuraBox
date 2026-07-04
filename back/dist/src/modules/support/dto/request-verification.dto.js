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
exports.RequestVerificationDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class RequestVerificationDto {
    idConversation;
    channel;
}
exports.RequestVerificationDto = RequestVerificationDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], RequestVerificationDto.prototype, "idConversation", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.VerificationChannel),
    __metadata("design:type", String)
], RequestVerificationDto.prototype, "channel", void 0);
//# sourceMappingURL=request-verification.dto.js.map