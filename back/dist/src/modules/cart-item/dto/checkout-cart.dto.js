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
exports.CheckoutCartDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const payments_constants_1 = require("../../payments/payments.constants");
const Trim = () => (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value));
class CheckoutAddressDto {
    street;
    streetNumber;
    locality;
    city;
    postalCode;
    province;
    instructions;
}
__decorate([
    Trim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CheckoutAddressDto.prototype, "street", void 0);
__decorate([
    Trim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CheckoutAddressDto.prototype, "streetNumber", void 0);
__decorate([
    Trim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CheckoutAddressDto.prototype, "locality", void 0);
__decorate([
    Trim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CheckoutAddressDto.prototype, "city", void 0);
__decorate([
    Trim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/, { message: 'Código postal inválido' }),
    __metadata("design:type", String)
], CheckoutAddressDto.prototype, "postalCode", void 0);
__decorate([
    Trim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CheckoutAddressDto.prototype, "province", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    Trim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CheckoutAddressDto.prototype, "instructions", void 0);
class CheckoutShippingDto {
    idClub;
    idCourier;
}
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CheckoutShippingDto.prototype, "idClub", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CheckoutShippingDto.prototype, "idCourier", void 0);
class CheckoutCartDto {
    paymentMethod;
    address;
    shipping;
}
exports.CheckoutCartDto = CheckoutCartDto;
__decorate([
    (0, class_validator_1.IsIn)(payments_constants_1.PAYMENT_METHOD_CODES),
    __metadata("design:type", String)
], CheckoutCartDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CheckoutAddressDto),
    __metadata("design:type", CheckoutAddressDto)
], CheckoutCartDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(50),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CheckoutShippingDto),
    __metadata("design:type", Array)
], CheckoutCartDto.prototype, "shipping", void 0);
//# sourceMappingURL=checkout-cart.dto.js.map