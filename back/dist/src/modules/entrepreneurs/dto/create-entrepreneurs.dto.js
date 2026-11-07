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
exports.CreateEntrepreneurDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const phone_1 = require("../../../common/utils/phone");
class CreateEntrepreneurDto {
    firstName;
    lastName;
    email;
    password;
    documentType;
    documentNumber;
    cuitCuil;
    phoneNumber;
    birthDate;
    city;
    province;
    active;
    bio;
    gender;
    country;
    streetAddress;
    addressNumber;
    floorNumber;
    addressDetails;
    postalCode;
    showGenderPublicly;
}
exports.CreateEntrepreneurDto = CreateEntrepreneurDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(64),
    (0, class_validator_1.Matches)(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'La contraseña debe tener al menos una mayúscula, una minúscula y un número',
    }),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.DocumentType),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "documentType", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateEntrepreneurDto.prototype, "documentNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateEntrepreneurDto.prototype, "cuitCuil", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, phone_1.NormalizePhone)(),
    (0, class_validator_1.Matches)(phone_1.PHONE_REGEX, { message: phone_1.PHONE_MESSAGE }),
    __metadata("design:type", Object)
], CreateEntrepreneurDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "province", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateEntrepreneurDto.prototype, "active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "streetAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateEntrepreneurDto.prototype, "addressNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "floorNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "addressDetails", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEntrepreneurDto.prototype, "postalCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateEntrepreneurDto.prototype, "showGenderPublicly", void 0);
//# sourceMappingURL=create-entrepreneurs.dto.js.map