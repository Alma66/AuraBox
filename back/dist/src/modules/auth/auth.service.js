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
const client_1 = require("@prisma/client");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcryptjs"));
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const ageOn = (birth, today = new Date()) => {
    let age = today.getUTCFullYear() - birth.getUTCFullYear();
    const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate()))
        age -= 1;
    return age;
};
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
        const lookup = { equals: email.trim(), mode: 'insensitive' };
        let user = null;
        let role = 'customer';
        const foundUser = await this.prisma.user.findFirst({ where: { email: lookup } });
        if (foundUser) {
            user = foundUser;
            role = 'customer';
        }
        if (!user) {
            const foundEntrepreneur = await this.prisma.entrepreneurs.findFirst({ where: { email: lookup } });
            if (foundEntrepreneur) {
                user = foundEntrepreneur;
                role = 'entrepreneur';
            }
        }
        if (!user) {
            const foundAdmin = await this.prisma.admins.findFirst({ where: { email: lookup } });
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
        if (user.active === false) {
            throw new common_1.UnauthorizedException('Cuenta deshabilitada');
        }
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
                orderBy: { associationDate: 'asc' },
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
    signRegistrationToken(id, purpose, expiresInSeconds) {
        return this.jwtService.sign({ sub: id, purpose }, { expiresIn: expiresInSeconds });
    }
    verifyRegistrationToken(token, expectedPurpose) {
        let payload;
        try {
            payload = this.jwtService.verify(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Token de registro inválido o expirado');
        }
        if (payload.purpose !== expectedPurpose) {
            throw new common_1.UnauthorizedException('Token de registro inválido');
        }
        return payload.sub;
    }
    async emailInUse(email) {
        const lookup = { equals: email.trim(), mode: 'insensitive' };
        const [customer, entrepreneur, admin] = await Promise.all([
            this.prisma.user.findFirst({ where: { email: lookup } }),
            this.prisma.entrepreneurs.findFirst({ where: { email: lookup } }),
            this.prisma.admins.findFirst({ where: { email: lookup } }),
        ]);
        return !!(customer || entrepreneur || admin);
    }
    async resolveRequiredRules(audience, acceptedRuleIds = []) {
        const scopes = [
            client_1.RuleAcceptanceScope.TODOS,
            audience === 'customer' ? client_1.RuleAcceptanceScope.CLIENTES : client_1.RuleAcceptanceScope.EMPRENDEDORES,
        ];
        const required = await this.prisma.platform_Rules.findMany({
            where: { active: true, acceptanceScope: { in: scopes } },
            select: { id: true, title: true, version: true },
        });
        const accepted = new Set(acceptedRuleIds);
        const missing = required.filter((rule) => !accepted.has(rule.id));
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`Falta tu aceptación de: ${missing.map((rule) => rule.title).join(', ')}. Si los documentos cambiaron, recargá la página y volvé a aceptarlos.`);
        }
        return required;
    }
    async registerCustomer(dto) {
        if (await this.emailInUse(dto.email))
            throw new common_1.BadRequestException('Ese email ya está registrado');
        const documentNumber = parseInt(dto.documentNumber, 10);
        const exists = await this.prisma.user.findFirst({ where: { documentNumber } });
        if (exists)
            throw new common_1.BadRequestException('Ese documento ya está registrado');
        const birthDate = new Date(dto.birthDate);
        if (ageOn(birthDate) < 16) {
            throw new common_1.BadRequestException('Debes tener al menos 16 años para registrarte como cliente.');
        }
        const requiredRules = await this.resolveRequiredRules('customer', dto.acceptedRuleIds);
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.$transaction(async (tx) => {
            const created = await tx.user.create({
                data: {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    email: dto.email,
                    passwordHash: hashed,
                    documentType: dto.documentType,
                    documentNumber,
                    phoneNumber: dto.phoneNumber ?? null,
                    birthDate,
                },
            });
            if (requiredRules.length > 0) {
                await tx.terms_Acceptance.createMany({
                    data: requiredRules.map((rule) => ({
                        accountType: 'customer',
                        idAccount: created.id,
                        idPlatformRule: rule.id,
                        ruleVersion: rule.version,
                    })),
                });
            }
            return created;
        });
        const { passwordHash, ...safe } = user;
        const profileToken = this.signRegistrationToken(user.id, 'complete-profile', 15 * 60);
        return { ...safe, role: 'customer', profileToken };
    }
    async completeCustomerProfile(dto) {
        const userId = this.verifyRegistrationToken(dto.profileToken, 'complete-profile');
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                streetAddress: dto.streetAddress ?? null,
                addressNumber: dto.addressNumber ?? null,
                floorNumber: dto.floorNumber ?? null,
                addressDetails: dto.addressDetails ?? null,
                city: dto.city ?? null,
                province: dto.province ?? null,
                postalCode: dto.postalCode ?? null,
            },
        });
        const { passwordHash, ...safe } = updated;
        return safe;
    }
    async registerEntrepreneur(dto) {
        if (await this.emailInUse(dto.email))
            throw new common_1.BadRequestException('Ese email ya está registrado');
        const documentNumber = parseInt(dto.documentNumber, 10);
        const exists = await this.prisma.entrepreneurs.findFirst({ where: { documentNumber } });
        if (exists)
            throw new common_1.BadRequestException('Ese documento ya está registrado');
        const birthDate = new Date(dto.birthDate);
        if (ageOn(birthDate) < 18) {
            throw new common_1.BadRequestException('Debes tener al menos 18 años para registrarte como emprendedor.');
        }
        const requiredRules = await this.resolveRequiredRules('entrepreneur', dto.acceptedRuleIds);
        const hashed = await bcrypt.hash(dto.password, 10);
        const entrepreneur = await this.prisma.$transaction(async (tx) => {
            const created = await tx.entrepreneurs.create({
                data: {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    email: dto.email,
                    passwordHash: hashed,
                    documentType: dto.documentType,
                    documentNumber,
                    phoneNumber: dto.phoneNumber ?? null,
                    birthDate,
                    city: dto.city ?? null,
                    province: dto.province ?? null,
                },
            });
            if (requiredRules.length > 0) {
                await tx.terms_Acceptance.createMany({
                    data: requiredRules.map((rule) => ({
                        accountType: 'entrepreneur',
                        idAccount: created.id,
                        idPlatformRule: rule.id,
                        ruleVersion: rule.version,
                    })),
                });
            }
            return created;
        });
        const { passwordHash, ...safe } = entrepreneur;
        const entrepreneurToken = this.signRegistrationToken(entrepreneur.id, 'entrepreneur-club', 30 * 60);
        return { ...safe, role: 'entrepreneur', entrepreneurToken };
    }
    async createClubFor(entrepreneurId, dto) {
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({
            where: { id: entrepreneurId },
        });
        if (!entrepreneur)
            throw new common_1.BadRequestException('Emprendedor no encontrado');
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.entrepreneur_Club.findFirst({
                where: { idEntrepreneurs: entrepreneurId },
            });
            if (existing)
                throw new common_1.BadRequestException('Este emprendedor ya tiene un club registrado');
            const club = await tx.club.create({
                data: {
                    name: dto.name,
                    logoUrl: dto.logoUrl ?? '',
                    slogan: dto.slogan ?? null,
                    history: dto.history ?? null,
                    shortDescription: dto.shortDescription,
                    contactEmail: dto.contactEmail,
                    whatsappContact: dto.whatsappContact ?? null,
                    clubStatus: 'PENDIENTE_APROBACION',
                },
            });
            await tx.entrepreneur_Club.create({
                data: {
                    idEntrepreneurs: entrepreneurId,
                    idClub: club.id,
                },
            });
            return club;
        });
    }
    async registerEntrepreneurClub(dto) {
        const entrepreneurId = this.verifyRegistrationToken(dto.entrepreneurToken, 'entrepreneur-club');
        return this.createClubFor(entrepreneurId, dto);
    }
    async createClubForSession(entrepreneurId, dto) {
        const club = await this.createClubFor(entrepreneurId, dto);
        const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: entrepreneurId } });
        const { access_token } = await this.buildToken({ ...entrepreneur, role: 'entrepreneur' });
        return { club, access_token };
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