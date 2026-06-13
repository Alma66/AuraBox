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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcryptjs"));
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    prisma;
    constructor(usersService, jwtService, prisma) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async validateUser(email, pass) {
        let user = null;
        let role = 'customer';
        const foundUser = await this.prisma.user.findUnique({ where: { email } });
        if (foundUser) {
            user = foundUser;
            role = 'customer';
        }
        if (!user) {
            const foundEntrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { email } });
            if (foundEntrepreneur) {
                user = foundEntrepreneur;
                role = 'entrepreneur';
            }
        }
        if (!user) {
            const foundAdmin = await this.prisma.admins.findUnique({ where: { email } });
            if (foundAdmin) {
                user = foundAdmin;
                role = 'admin';
            }
        }
        if (!user)
            return null;
        const ok = await bcrypt.compare(pass, user.passwordHash);
        if (!ok)
            return null;
        const { passwordHash, ...safe } = user;
        return { ...safe, role };
    }
    async loginWithCredentials(email, password) {
        const user = await this.validateUser(email, password);
        if (!user)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        return this.buildToken(user);
    }
    async buildToken(user) {
        let managedClubId = null;
        if (user.role === 'entrepreneur') {
            const association = await this.prisma.entrepreneur_Club.findFirst({
                where: { idEntrepreneurs: user.id },
                orderBy: { associationDate: 'desc' },
            });
            if (association)
                managedClubId = association.idClub;
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        };
        if (managedClubId)
            payload.managedClubId = managedClubId;
        const token = this.jwtService.sign(payload);
        return { access_token: token };
    }
    async registerCustomer(dto) {
        const exists = await this.prisma.user.findFirst({
            where: { OR: [{ email: dto.email }, { documentNumber: parseInt(dto.documentNumber) }] },
        });
        if (exists)
            throw new common_1.BadRequestException('Email o documento ya registrado');
        const birthDate = new Date(dto.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age < 16)
            throw new common_1.BadRequestException('Debes tener al menos 16 años para registrarte como cliente.');
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                passwordHash: hashed,
                documentType: dto.documentType,
                documentNumber: parseInt(dto.documentNumber),
                phoneNumber: dto.phoneNumber ? parseInt(dto.phoneNumber) : null,
                birthDate: new Date(dto.birthDate),
            },
        });
        const { passwordHash, ...safe } = user;
        return { ...safe, role: 'customer' };
    }
    async completeCustomerProfile(dto) {
        const { userId, streetAddress, addressNumber, floorNumber, addressDetails, city, province, postalCode } = dto;
        if (!userId)
            throw new common_1.BadRequestException('userId es requerido');
        const updated = await this.prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                streetAddress: streetAddress ?? null,
                addressNumber: addressNumber ? parseInt(addressNumber) : null,
                floorNumber: floorNumber ?? null,
                addressDetails: addressDetails ?? null,
                city: city ?? null,
                province: province ?? null,
                postalCode: postalCode ?? null,
            },
        });
        const { passwordHash, ...safe } = updated;
        return safe;
    }
    async registerEntrepreneur(dto) {
        const exists = await this.prisma.entrepreneurs.findFirst({
            where: { OR: [{ email: dto.email }, { documentNumber: parseInt(dto.documentNumber) }] },
        });
        if (exists)
            throw new common_1.BadRequestException('Email o documento ya registrado');
        const birthDate = new Date(dto.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age < 18)
            throw new common_1.BadRequestException('Debes tener al menos 18 años para registrarte como emprendedor.');
        const hashed = await bcrypt.hash(dto.password, 10);
        const entrepreneur = await this.prisma.entrepreneurs.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                passwordHash: hashed,
                documentType: dto.documentType,
                documentNumber: parseInt(dto.documentNumber),
                phoneNumber: dto.phoneNumber ? parseInt(dto.phoneNumber) : null,
                birthDate: new Date(dto.birthDate),
                city: dto.city ?? null,
                province: dto.province ?? null,
            },
        });
        const { passwordHash, ...safe } = entrepreneur;
        return { ...safe, role: 'entrepreneur' };
    }
    async registerEntrepreneurClub(dto) {
        const { entrepreneurId, name, logoUrl, shortDescription, contactEmail, slogan, history, whatsappContact } = dto;
        if (!entrepreneurId)
            throw new common_1.BadRequestException('entrepreneurId es requerido');
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({
            where: { id: parseInt(entrepreneurId) },
        });
        if (!entrepreneur)
            throw new common_1.BadRequestException('Emprendedor no encontrado');
        const club = await this.prisma.club.create({
            data: {
                name,
                logoUrl: logoUrl ?? '',
                slogan: slogan ?? null,
                history: history ?? null,
                shortDescription,
                contactEmail,
                whatsappContact: whatsappContact ?? null,
                clubStatus: 'PENDIENTE_APROBACION',
            },
        });
        await this.prisma.entrepreneur_Club.create({
            data: {
                idEntrepreneurs: parseInt(entrepreneurId),
                idClub: club.id,
            },
        });
        return club;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map