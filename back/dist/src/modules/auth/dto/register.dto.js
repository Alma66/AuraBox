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
exports.RegisterClubDto = exports.CreateClubDto = exports.CompleteCustomerProfileDto = exports.RegisterEntrepreneurDto = exports.RegisterCustomerDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const phone_1 = require("../../../common/utils/phone");
const Trim = () => (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value));
const Lower = () => (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));
const EmptyToUndefined = () => (0, class_transformer_1.Transform)(({ value }) => {
    if (typeof value !== 'string')
        return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
});
const DigitsToNumber = () => (0, class_transformer_1.Transform)(({ value }) => {
    if (value === null || value === undefined || value === '')
        return undefined;
    const digits = String(value).replace(/\D/g, '');
    return digits ? Number(digits) : undefined;
});
const POSTAL_CODE = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/;
class RegisterCustomerDto {
    firstName;
    lastName;
    email;
    password;
    documentType;
    documentNumber;
    phoneNumber;
    birthDate;
    acceptedRuleIds;
}
exports.RegisterCustomerDto = RegisterCustomerDto;
__decorate([
    Trim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre es obligatorio' }),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "firstName", void 0);
__decorate([
    Trim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El apellido es obligatorio' }),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "lastName", void 0);
__decorate([
    Lower(),
    (0, class_validator_1.IsEmail)({}, { message: 'El email no es válido' }),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    (0, class_validator_1.MaxLength)(72, { message: 'La contraseña no puede superar los 72 caracteres' }),
    (0, class_validator_1.Matches)(/[A-Z]/, { message: 'La contraseña debe incluir una mayúscula' }),
    (0, class_validator_1.Matches)(/[a-z]/, { message: 'La contraseña debe incluir una minúscula' }),
    (0, class_validator_1.Matches)(/\d/, { message: 'La contraseña debe incluir un número' }),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['DNI', 'Pasaporte', 'LC', 'LE'], { message: 'Tipo de documento inválido' }),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "documentType", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (value === undefined || value === null ? value : String(value).trim())),
    (0, class_validator_1.Matches)(/^\d{6,9}$/, { message: 'El número de documento no es válido' }),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "documentNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, phone_1.NormalizePhone)(),
    (0, class_validator_1.Matches)(phone_1.PHONE_REGEX, { message: phone_1.PHONE_MESSAGE }),
    __metadata("design:type", Object)
], RegisterCustomerDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de nacimiento no es válida' }),
    __metadata("design:type", String)
], RegisterCustomerDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (Array.isArray(value) ? value.map((item) => Number(item)) : value)),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_validator_1.Min)(1, { each: true }),
    __metadata("design:type", Array)
], RegisterCustomerDto.prototype, "acceptedRuleIds", void 0);
class RegisterEntrepreneurDto extends RegisterCustomerDto {
    city;
    province;
}
exports.RegisterEntrepreneurDto = RegisterEntrepreneurDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], RegisterEntrepreneurDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], RegisterEntrepreneurDto.prototype, "province", void 0);
class CompleteCustomerProfileDto {
    profileToken;
    streetAddress;
    addressNumber;
    floorNumber;
    addressDetails;
    city;
    province;
    postalCode;
}
exports.CompleteCustomerProfileDto = CompleteCustomerProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'profileToken es requerido' }),
    __metadata("design:type", String)
], CompleteCustomerProfileDto.prototype, "profileToken", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CompleteCustomerProfileDto.prototype, "streetAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    DigitsToNumber(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(99999),
    __metadata("design:type", Number)
], CompleteCustomerProfileDto.prototype, "addressNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CompleteCustomerProfileDto.prototype, "floorNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CompleteCustomerProfileDto.prototype, "addressDetails", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], CompleteCustomerProfileDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], CompleteCustomerProfileDto.prototype, "province", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.Matches)(POSTAL_CODE, { message: 'El código postal no es válido' }),
    __metadata("design:type", String)
], CompleteCustomerProfileDto.prototype, "postalCode", void 0);
class CreateClubDto {
    name;
    shortDescription;
    contactEmail;
    slogan;
    history;
    whatsappContact;
    logoUrl;
}
exports.CreateClubDto = CreateClubDto;
__decorate([
    Trim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre del club es obligatorio' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateClubDto.prototype, "name", void 0);
__decorate([
    Trim(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción es obligatoria' }),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateClubDto.prototype, "shortDescription", void 0);
__decorate([
    Lower(),
    (0, class_validator_1.IsEmail)({}, { message: 'El email de contacto no es válido' }),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateClubDto.prototype, "contactEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateClubDto.prototype, "slogan", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateClubDto.prototype, "history", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], CreateClubDto.prototype, "whatsappContact", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    EmptyToUndefined(),
    (0, class_validator_1.IsUrl)({ protocols: ['https'], require_protocol: true }),
    __metadata("design:type", String)
], CreateClubDto.prototype, "logoUrl", void 0);
class RegisterClubDto extends CreateClubDto {
    entrepreneurToken;
}
exports.RegisterClubDto = RegisterClubDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'entrepreneurToken es requerido' }),
    __metadata("design:type", String)
], RegisterClubDto.prototype, "entrepreneurToken", void 0);
//# sourceMappingURL=register.dto.js.map