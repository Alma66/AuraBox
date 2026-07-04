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
exports.CreateSubscriptionTypeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateSubscriptionTypeDto {
    idClub;
    name;
    description;
    basePrice;
    price;
    frequency;
    cashDiscount;
    transferDiscount;
    active;
    shippingAreas;
    includes;
    imageUrl;
}
exports.CreateSubscriptionTypeDto = CreateSubscriptionTypeDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        const v = value ?? obj?.clubId;
        return v !== undefined ? Number(v) : v;
    }),
    __metadata("design:type", Number)
], CreateSubscriptionTypeDto.prototype, "idClub", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateSubscriptionTypeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionTypeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        const v = value ?? obj?.price;
        return v !== undefined ? String(v) : v;
    }),
    __metadata("design:type", String)
], CreateSubscriptionTypeDto.prototype, "basePrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value !== undefined && value !== null ? String(value) : undefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionTypeDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Frequency),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        const raw = value ?? obj?.deliveryFrequency ?? '';
        const map = {
            'Única': 'Unica', 'Unica': 'Unica',
            'Mensual': 'Mensual',
            'Bimestral': 'Bimestral',
            'Trimestral': 'Trimestral',
            'Cuatrimestral': 'Cuatrimestral',
            'Quinquemestral': 'Quinquemestral',
            'Semestral': 'Semestral',
            'Anual': 'Anual',
        };
        return map[raw] ?? raw;
    }),
    __metadata("design:type", String)
], CreateSubscriptionTypeDto.prototype, "frequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        const v = value ?? obj?.descuentoEfectivo;
        return v !== undefined && v !== null ? String(v) : undefined;
    }),
    __metadata("design:type", String)
], CreateSubscriptionTypeDto.prototype, "cashDiscount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        const v = value ?? obj?.descuentoTransferencia;
        return v !== undefined && v !== null ? String(v) : undefined;
    }),
    __metadata("design:type", String)
], CreateSubscriptionTypeDto.prototype, "transferDiscount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => {
        const v = value ?? obj?.activo;
        return v !== undefined ? Boolean(v) : true;
    }),
    __metadata("design:type", Boolean)
], CreateSubscriptionTypeDto.prototype, "active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionTypeDto.prototype, "shippingAreas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionTypeDto.prototype, "includes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionTypeDto.prototype, "imageUrl", void 0);
//# sourceMappingURL=create-subscription-types.dto.js.map