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
exports.CreateBoxContentHistoryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
function toBoolean({ value }) {
    if (typeof value === 'boolean')
        return value;
    if (value === 'true' || value === '1')
        return true;
    if (value === 'false' || value === '0')
        return false;
    return value;
}
class CreateBoxContentHistoryDto {
    idSubscriptionTypes;
    deliveryMonthYear;
    productName;
    productDescription;
    usageInstructions;
    productExpirationDate;
    productImageUrl;
    productVideoUrl;
    additionalNotes;
    publicationDate;
    ageRestriction;
    originLocation;
    containsAllergens;
    allergensDetail;
    isDangerousItem;
    dangerDetail;
    requiresCleaning;
    cleaningInstructions;
}
exports.CreateBoxContentHistoryDto = CreateBoxContentHistoryDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Transform)(({ value }) => (value !== undefined ? Number(value) : value)),
    __metadata("design:type", Number)
], CreateBoxContentHistoryDto.prototype, "idSubscriptionTypes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(7),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "deliveryMonthYear", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "productName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "productDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "usageInstructions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "productExpirationDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "productImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "productVideoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "additionalNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "publicationDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(toBoolean),
    __metadata("design:type", Boolean)
], CreateBoxContentHistoryDto.prototype, "ageRestriction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "originLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(toBoolean),
    __metadata("design:type", Boolean)
], CreateBoxContentHistoryDto.prototype, "containsAllergens", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "allergensDetail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(toBoolean),
    __metadata("design:type", Boolean)
], CreateBoxContentHistoryDto.prototype, "isDangerousItem", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "dangerDetail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(toBoolean),
    __metadata("design:type", Boolean)
], CreateBoxContentHistoryDto.prototype, "requiresCleaning", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBoxContentHistoryDto.prototype, "cleaningInstructions", void 0);
//# sourceMappingURL=create-box-content-history.dto.js.map