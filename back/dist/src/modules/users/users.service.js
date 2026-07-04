"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const client_1 = require("@prisma/client");
const USER_SELECT = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    documentType: true,
    documentNumber: true,
    registrationDate: true,
    birthDate: true,
    balanceAvailable: true,
    phoneNumber: true,
    streetAddress: true,
    addressNumber: true,
    floorNumber: true,
    addressDetails: true,
    city: true,
    province: true,
    postalCode: true,
    active: true,
    acceptsNewsletter: true,
};
function sanitizeUser(user) {
    if (!user)
        return user;
    const { passwordHash, ...rest } = user;
    if (rest.registrationDate instanceof Date) {
        rest.registrationDate = rest.registrationDate.toISOString();
    }
    if (rest.birthDate instanceof Date) {
        rest.birthDate = rest.birthDate.toISOString();
    }
    if (rest.balanceAvailable !== undefined && rest.balanceAvailable !== null) {
        try {
            rest.balanceAvailable = rest.balanceAvailable.toString();
        }
        catch { }
    }
    return rest;
}
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const hashed = await bcrypt.hash(dto.password, 10);
        const data = {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            passwordHash: hashed,
            documentType: dto.documentType,
            documentNumber: dto.documentNumber,
            phoneNumber: dto.phoneNumber ?? null,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        };
        try {
            const user = await this.prisma.user.create({ data });
            return sanitizeUser(user);
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new common_1.BadRequestException('Email o número de documento ya registrado');
            }
            throw err;
        }
    }
    async findAll() {
        const users = await this.prisma.user.findMany({ select: USER_SELECT });
        return users.map(sanitizeUser);
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        return sanitizeUser(user);
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async update(id, dto) {
        const data = {};
        if (dto.firstName !== undefined)
            data.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            data.lastName = dto.lastName;
        if (dto.password)
            data.passwordHash = await bcrypt.hash(dto.password, 10);
        if (dto.documentType !== undefined)
            data.documentType = dto.documentType;
        if (dto.documentNumber !== undefined)
            data.documentNumber = dto.documentNumber;
        if (dto.phoneNumber !== undefined)
            data.phoneNumber = dto.phoneNumber;
        if (dto.birthDate !== undefined)
            data.birthDate = new Date(dto.birthDate);
        if (dto.streetAddress !== undefined)
            data.streetAddress = dto.streetAddress;
        if (dto.addressNumber !== undefined)
            data.addressNumber = dto.addressNumber;
        if (dto.floorNumber !== undefined)
            data.floorNumber = dto.floorNumber;
        if (dto.addressDetails !== undefined)
            data.addressDetails = dto.addressDetails;
        if (dto.city !== undefined)
            data.city = dto.city;
        if (dto.province !== undefined)
            data.province = dto.province;
        if (dto.postalCode !== undefined)
            data.postalCode = dto.postalCode;
        if (dto.acceptsNewsletter !== undefined)
            data.acceptsNewsletter = dto.acceptsNewsletter;
        try {
            const updated = await this.prisma.user.update({ where: { id }, data, select: USER_SELECT });
            return sanitizeUser(updated);
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
            throw err;
        }
    }
    async verifyPassword(id, password) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Contraseña incorrecta');
        return { ok: true };
    }
    async remove(id) {
        try {
            await this.prisma.user.delete({ where: { id } });
            return { ok: true };
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
            throw err;
        }
    }
    async findSubscribersByClub(idClub) {
        const subTypes = await this.prisma.subscription_Types.findMany({
            where: { idClub },
            select: { id: true },
        });
        const subTypeIds = subTypes.map((s) => s.id);
        if (subTypeIds.length === 0)
            return [];
        const activeSubs = await this.prisma.user_Subscriptions.findMany({
            where: {
                idSubscriptionTypes: { in: subTypeIds },
                subscriptionStatus: 'Activa',
            },
            select: { idUser: true },
        });
        const userIds = Array.from(new Set(activeSubs.map((s) => s.idUser)));
        if (userIds.length === 0)
            return [];
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds }, acceptsNewsletter: true },
            select: USER_SELECT,
        });
        return users.map(sanitizeUser);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map