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
exports.CreateTransactionHistoryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateTransactionHistoryDto {
    idUser;
    idUserSubscriptions;
    idGatewayTransaction;
    idClub;
    idPaymentMethods;
    totalAmountPaid;
    clubAmount;
    commissionAmount;
    paymentDate;
    paymentStatus;
    paymentNotes;
}
exports.CreateTransactionHistoryDto = CreateTransactionHistoryDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTransactionHistoryDto.prototype, "idUser", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTransactionHistoryDto.prototype, "idUserSubscriptions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionHistoryDto.prototype, "idGatewayTransaction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTransactionHistoryDto.prototype, "idClub", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTransactionHistoryDto.prototype, "idPaymentMethods", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (value === null || value === undefined ? value : parseFloat(String(value)))),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransactionHistoryDto.prototype, "totalAmountPaid", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (value === null || value === undefined ? value : parseFloat(String(value)))),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransactionHistoryDto.prototype, "clubAmount", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => (value === null || value === undefined ? value : parseFloat(String(value)))),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransactionHistoryDto.prototype, "commissionAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTransactionHistoryDto.prototype, "paymentDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.PaymentStatus),
    __metadata("design:type", String)
], CreateTransactionHistoryDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionHistoryDto.prototype, "paymentNotes", void 0);
//# sourceMappingURL=create-transaction-history.dto.js.map