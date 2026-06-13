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
exports.ClubPaymentMethodService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClubPaymentMethodService = class ClubPaymentMethodService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethod } });
        if (!pm)
            throw new common_1.NotFoundException('Método de pago no encontrado');
        const exists = await this.prisma.club_Payment_Method.findFirst({
            where: { idClub: dto.idClub, idPaymentMethod: dto.idPaymentMethod },
        });
        if (exists)
            throw new common_1.ConflictException('La asociación club-método de pago ya existe');
        return this.prisma.club_Payment_Method.create({
            data: {
                idClub: dto.idClub,
                idPaymentMethod: dto.idPaymentMethod,
            },
        });
    }
    async findAll() {
        return this.prisma.club_Payment_Method.findMany({ orderBy: { id: 'desc' } });
    }
    async findByClub(idClub) {
        return this.prisma.club_Payment_Method.findMany({
            where: { idClub },
            orderBy: { id: 'desc' },
        });
    }
    async findByPaymentMethod(idPaymentMethod) {
        return this.prisma.club_Payment_Method.findMany({
            where: { idPaymentMethod },
            orderBy: { id: 'desc' },
        });
    }
    async findOne(id) {
        const item = await this.prisma.club_Payment_Method.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Asociación club-método de pago no encontrada');
        return item;
    }
    async update(id, dto) {
        const existing = await this.prisma.club_Payment_Method.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Asociación club-método de pago no encontrada');
        if (dto.idClub) {
            const c = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
            if (!c)
                throw new common_1.NotFoundException('Club (nuevo) no encontrado');
        }
        if (dto.idPaymentMethod) {
            const pm = await this.prisma.payment_Methods.findUnique({ where: { id: dto.idPaymentMethod } });
            if (!pm)
                throw new common_1.NotFoundException('Método de pago (nuevo) no encontrado');
        }
        if (dto.idClub || dto.idPaymentMethod) {
            const newIdClub = dto.idClub ?? existing.idClub;
            const newIdPaymentMethod = dto.idPaymentMethod ?? existing.idPaymentMethod;
            const duplicate = await this.prisma.club_Payment_Method.findFirst({
                where: { idClub: newIdClub, idPaymentMethod: newIdPaymentMethod, NOT: { id } },
            });
            if (duplicate)
                throw new common_1.ConflictException('Otra asociación con esos valores ya existe');
        }
        return this.prisma.club_Payment_Method.update({
            where: { id },
            data: {
                idClub: dto.idClub ?? existing.idClub,
                idPaymentMethod: dto.idPaymentMethod ?? existing.idPaymentMethod,
            },
        });
    }
    async remove(id) {
        const existing = await this.prisma.club_Payment_Method.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Asociación club-método de pago no encontrada');
        await this.prisma.club_Payment_Method.delete({ where: { id } });
        return { message: 'Asociación eliminada correctamente' };
    }
};
exports.ClubPaymentMethodService = ClubPaymentMethodService;
exports.ClubPaymentMethodService = ClubPaymentMethodService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClubPaymentMethodService);
//# sourceMappingURL=club-payment-method.service.js.map