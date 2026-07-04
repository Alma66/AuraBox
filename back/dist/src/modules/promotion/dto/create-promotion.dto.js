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
exports.CreatePromotionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreatePromotionDto {
    idClub;
    name;
    description;
    promotionType;
    discountPercentage;
    idSubscriptionTypes;
    comboSubscriptionIds;
    minSubscriptionsQty;
    freeShipping;
    couponCode;
    durationMonths;
    startDate;
    endDate;
    active;
}
exports.CreatePromotionDto = CreatePromotionDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "idClub", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.PromotionType),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "promotionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === undefined || value === null || value === '' ? undefined : parseInt(value, 10))),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "idSubscriptionTypes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "comboSubscriptionIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === undefined || value === null || value === '' ? undefined : parseInt(value, 10))),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "minSubscriptionsQty", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePromotionDto.prototype, "freeShipping", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "couponCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === undefined || value === null || value === '' ? undefined : parseInt(value, 10))),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "durationMonths", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePromotionDto.prototype, "active", void 0);
//# sourceMappingURL=create-promotion.dto.js.map