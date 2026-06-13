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
exports.UpdateUserSubscriptionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class UpdateUserSubscriptionDto {
    subscriptionStatus;
    lastPaymentDate;
    nextPaymentDate;
    monthlyAmountPaid;
    cancellationReason;
    cancellationDate;
}
exports.UpdateUserSubscriptionDto = UpdateUserSubscriptionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SubscriptionStatus),
    __metadata("design:type", String)
], UpdateUserSubscriptionDto.prototype, "subscriptionStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Transform)(({ value }) => (value ? new Date(value) : undefined)),
    __metadata("design:type", Date)
], UpdateUserSubscriptionDto.prototype, "lastPaymentDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Transform)(({ value }) => (value ? new Date(value) : undefined)),
    __metadata("design:type", Date)
], UpdateUserSubscriptionDto.prototype, "nextPaymentDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === null || value === undefined ? value : String(value))),
    __metadata("design:type", String)
], UpdateUserSubscriptionDto.prototype, "monthlyAmountPaid", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserSubscriptionDto.prototype, "cancellationReason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Transform)(({ value }) => (value ? new Date(value) : undefined)),
    __metadata("design:type", Date)
], UpdateUserSubscriptionDto.prototype, "cancellationDate", void 0);
//# sourceMappingURL=update-user-subscription.dto.js.map