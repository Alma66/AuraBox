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
exports.UserClubPreferencesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(preference) {
    if (!preference)
        return preference;
    if (preference.updateDate instanceof Date)
        preference.updateDate = preference.updateDate.toISOString();
    return preference;
}
let UserClubPreferencesService = class UserClubPreferencesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertClubAccess(idClub, user) {
        if (user.role === 'admin')
            return;
        const assoc = await this.prisma.entrepreneur_Club.findFirst({
            where: { idClub, idEntrepreneurs: user.id },
        });
        if (!assoc)
            throw new common_1.ForbiddenException('No tenés acceso a este club');
    }
    async assertPreferenceAccess(item, user) {
        if (user.role === 'admin')
            return;
        if (user.role === 'customer' && item.idUser === user.id)
            return;
        if (user.role === 'entrepreneur') {
            await this.assertClubAccess(item.idClub, user);
            return;
        }
        throw new common_1.ForbiddenException('No autorizado para acceder a esta preferencia');
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
        if (!subType)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        const created = await this.prisma.user_Club_Preferences.create({
            data: {
                idUser: dto.idUser,
                idSubscriptionTypes: dto.idSubscriptionTypes,
                idClub: dto.idClub,
                preferenceType: dto.preferenceType,
                preferenceValue: dto.preferenceValue,
                updateDate: dto.updateDate ? new Date(dto.updateDate) : new Date(),
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const preferences = await this.prisma.user_Club_Preferences.findMany({ orderBy: { updateDate: 'desc' } });
        return preferences.map(sanitize);
    }
    async findOne(id, user) {
        const item = await this.prisma.user_Club_Preferences.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Preferencia no encontrada');
        await this.assertPreferenceAccess(item, user);
        return sanitize(item);
    }
    async findByUser(idUser) {
        const preferences = await this.prisma.user_Club_Preferences.findMany({
            where: { idUser },
            orderBy: { updateDate: 'desc' },
        });
        return preferences.map(sanitize);
    }
    async findByClub(idClub, user) {
        await this.assertClubAccess(idClub, user);
        const preferences = await this.prisma.user_Club_Preferences.findMany({
            where: { idClub },
            orderBy: { updateDate: 'desc' },
        });
        return preferences.map(sanitize);
    }
    async findBySubscriptionType(idSubscriptionTypes, user) {
        const subType = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
        if (!subType)
            throw new common_1.NotFoundException('Tipo de suscripción no encontrado');
        await this.assertClubAccess(subType.idClub, user);
        const preferences = await this.prisma.user_Club_Preferences.findMany({
            where: { idSubscriptionTypes },
            orderBy: { updateDate: 'desc' },
        });
        return preferences.map(sanitize);
    }
    async update(id, dto, user) {
        const item = await this.prisma.user_Club_Preferences.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Preferencia no encontrada');
        await this.assertPreferenceAccess(item, user);
        if (dto.idUser) {
            const u = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
            if (!u)
                throw new common_1.NotFoundException('Usuario (nuevo) no encontrado');
        }
        if (dto.idClub) {
            const c = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
            if (!c)
                throw new common_1.NotFoundException('Club (nuevo) no encontrado');
        }
        if (dto.idSubscriptionTypes) {
            const st = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
            if (!st)
                throw new common_1.NotFoundException('Tipo de suscripción (nuevo) no encontrado');
        }
        const updated = await this.prisma.user_Club_Preferences.update({
            where: { id },
            data: {
                ...dto,
                updateDate: dto.updateDate ? new Date(dto.updateDate) : item.updateDate,
            },
        });
        return sanitize(updated);
    }
    async remove(id, user) {
        const item = await this.prisma.user_Club_Preferences.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Preferencia no encontrada');
        await this.assertPreferenceAccess(item, user);
        await this.prisma.user_Club_Preferences.delete({ where: { id } });
        return { message: 'Preferencia eliminada correctamente' };
    }
};
exports.UserClubPreferencesService = UserClubPreferencesService;
exports.UserClubPreferencesService = UserClubPreferencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserClubPreferencesService);
//# sourceMappingURL=user-club-preferences.service.js.map