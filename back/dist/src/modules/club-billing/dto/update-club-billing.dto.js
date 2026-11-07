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
exports.UpdateClubBillingDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const payments_constants_1 = require("../../payments/payments.constants");
const NullableTrim = () => (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() || null : value));
class UpdateClubBillingDto {
    bankHolder;
    bankCbu;
    bankAlias;
    methods;
}
exports.UpdateClubBillingDto = UpdateClubBillingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    NullableTrim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", Object)
], UpdateClubBillingDto.prototype, "bankHolder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    NullableTrim(),
    (0, class_validator_1.Matches)(/^\d{22}$/, { message: 'El CBU debe tener 22 dígitos' }),
    __metadata("design:type", Object)
], UpdateClubBillingDto.prototype, "bankCbu", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    NullableTrim(),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9.-]{6,20}$/, {
        message: 'El alias debe tener entre 6 y 20 caracteres (letras, números, puntos o guiones)',
    }),
    __metadata("design:type", Object)
], UpdateClubBillingDto.prototype, "bankAlias", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Elegí al menos un medio de pago' }),
    (0, class_validator_1.IsIn)(payments_constants_1.PAYMENT_METHOD_CODES, { each: true }),
    __metadata("design:type", Array)
], UpdateClubBillingDto.prototype, "methods", void 0);
//# sourceMappingURL=update-club-billing.dto.js.map