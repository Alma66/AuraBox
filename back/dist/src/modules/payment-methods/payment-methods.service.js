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
exports.PaymentMethodsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PaymentMethodsService = class PaymentMethodsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const exists = await this.prisma.payment_Methods.findUnique({ where: { method: dto.method } });
        if (exists)
            throw new common_1.ConflictException('Ya existe un método de pago con ese nombre');
        return this.prisma.payment_Methods.create({
            data: {
                method: dto.method,
                active: dto.active ?? true,
            },
        });
    }
    async findAll() {
        return this.prisma.payment_Methods.findMany({ orderBy: { id: 'desc' } });
    }
    async findActive() {
        return this.prisma.payment_Methods.findMany({
            where: { active: true },
            orderBy: { id: 'desc' },
        });
    }
    async findByMethod(method) {
        return this.prisma.payment_Methods.findUnique({ where: { method } });
    }
    async findOne(id) {
        const item = await this.prisma.payment_Methods.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Método de pago no encontrado');
        return item;
    }
    async update(id, dto) {
        const item = await this.prisma.payment_Methods.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Método de pago no encontrado');
        if (dto.method && dto.method !== item.method) {
            const dup = await this.prisma.payment_Methods.findUnique({ where: { method: dto.method } });
            if (dup)
                throw new common_1.ConflictException('Ya existe otro método de pago con ese nombre');
        }
        return this.prisma.payment_Methods.update({
            where: { id },
            data: { ...dto },
        });
    }
    async remove(id) {
        const item = await this.prisma.payment_Methods.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Método de pago no encontrado');
        await this.prisma.payment_Methods.delete({ where: { id } });
        return { message: 'Método de pago eliminado correctamente' };
    }
};
exports.PaymentMethodsService = PaymentMethodsService;
exports.PaymentMethodsService = PaymentMethodsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentMethodsService);
//# sourceMappingURL=payment-methods.service.js.map