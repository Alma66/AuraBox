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
exports.CreateUserSubscriptionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateUserSubscriptionDto {
    idUser;
    idSubscriptionTypes;
    idPaymentMethods;
    startDate;
    expectedEndDate;
    monthlyAmountPaid;
    cancellationReason;
    cancellationDate;
}
exports.CreateUserSubscriptionDto = CreateUserSubscriptionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateUserSubscriptionDto.prototype, "idUser", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateUserSubscriptionDto.prototype, "idSubscriptionTypes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateUserSubscriptionDto.prototype, "idPaymentMethods", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Transform)(({ value }) => (value ? new Date(value) : undefined)),
    __metadata("design:type", Date)
], CreateUserSubscriptionDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Transform)(({ value }) => (value ? new Date(value) : undefined)),
    __metadata("design:type", Date)
], CreateUserSubscriptionDto.prototype, "expectedEndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === null || value === undefined ? value : String(value))),
    __metadata("design:type", String)
], CreateUserSubscriptionDto.prototype, "monthlyAmountPaid", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserSubscriptionDto.prototype, "cancellationReason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Transform)(({ value }) => (value ? new Date(value) : undefined)),
    __metadata("design:type", Date)
], CreateUserSubscriptionDto.prototype, "cancellationDate", void 0);
//# sourceMappingURL=create-user-subscription.dto.js.map