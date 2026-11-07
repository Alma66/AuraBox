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
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(favorite) {
    if (!favorite)
        return favorite;
    if (favorite.dateAdded instanceof Date)
        favorite.dateAdded = favorite.dateAdded.toISOString();
    return favorite;
}
function mapPlan(p) {
    let includes = [];
    if (p.includes) {
        try {
            includes = JSON.parse(p.includes);
        }
        catch {
            includes = [];
        }
    }
    return {
        planId: p.id,
        name: p.name,
        description: p.description,
        price: p.basePrice ? Number(p.basePrice) : 0,
        currency: 'ARS',
        deliveryFrequency: p.frequency,
        image: p.imageUrl ?? '',
        includes,
        active: p.active,
        cashDiscount: p.cashDiscount ? Number(p.cashDiscount) : 0,
        transferDiscount: p.transferDiscount ? Number(p.transferDiscount) : 0,
    };
}
let FavoritesService = class FavoritesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const plan = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
        if (!plan)
            throw new common_1.NotFoundException('Plan de suscripción no encontrado');
        const club = await this.prisma.club.findUnique({ where: { id: plan.idClub } });
        if (!plan.active || !club || club.clubStatus !== 'APROBADO') {
            throw new common_1.BadRequestException('Este plan no está disponible');
        }
        const existing = await this.prisma.favorites.findFirst({
            where: { idUser: dto.idUser, idSubscriptionTypes: dto.idSubscriptionTypes },
        });
        if (existing)
            throw new common_1.BadRequestException('Ya tienes este plan en favoritos');
        const created = await this.prisma.favorites.create({
            data: {
                idUser: dto.idUser,
                idSubscriptionTypes: dto.idSubscriptionTypes,
                dateAdded: dto.dateAdded ? new Date(dto.dateAdded) : new Date(),
            },
        });
        return sanitize(created);
    }
    async toggle(idUser, idSubscriptionTypes) {
        const plan = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
        if (!plan)
            throw new common_1.NotFoundException('Plan de suscripción no encontrado');
        const existing = await this.prisma.favorites.findFirst({ where: { idUser, idSubscriptionTypes } });
        if (existing) {
            await this.prisma.favorites.delete({ where: { id: existing.id } });
            return { isFavorite: false };
        }
        const club = await this.prisma.club.findUnique({ where: { id: plan.idClub } });
        if (!plan.active || !club || club.clubStatus !== 'APROBADO') {
            throw new common_1.BadRequestException('Este plan no está disponible');
        }
        await this.prisma.favorites.create({ data: { idUser, idSubscriptionTypes, dateAdded: new Date() } });
        return { isFavorite: true };
    }
    async check(idUser, idSubscriptionTypes) {
        const existing = await this.prisma.favorites.findFirst({ where: { idUser, idSubscriptionTypes } });
        return { isFavorite: !!existing };
    }
    async findAll() {
        const favorites = await this.prisma.favorites.findMany({ orderBy: { dateAdded: 'desc' } });
        return favorites.map(sanitize);
    }
    async findOne(id) {
        const favorite = await this.prisma.favorites.findUnique({ where: { id } });
        if (!favorite)
            throw new common_1.NotFoundException('Favorito no encontrado');
        return sanitize(favorite);
    }
    async findByUserEnriched(idUser) {
        const favorites = await this.prisma.favorites.findMany({
            where: { idUser },
            orderBy: { dateAdded: 'desc' },
        });
        if (favorites.length === 0)
            return [];
        const planIds = favorites.map((f) => f.idSubscriptionTypes);
        const plans = await this.prisma.subscription_Types.findMany({ where: { id: { in: planIds } } });
        const plansById = new Map(plans.map((p) => [p.id, p]));
        const clubIds = [...new Set(plans.map((p) => p.idClub))];
        const clubs = await this.prisma.club.findMany({ where: { id: { in: clubIds } } });
        const clubsById = new Map(clubs.map((c) => [c.id, c]));
        return favorites
            .map((fav) => {
            const plan = plansById.get(fav.idSubscriptionTypes);
            if (!plan)
                return null;
            const club = clubsById.get(plan.idClub);
            if (!club)
                return null;
            if (!plan.active || club.clubStatus !== 'APROBADO')
                return null;
            return {
                favoriteId: fav.id,
                idSubscriptionTypes: fav.idSubscriptionTypes,
                dateAdded: fav.dateAdded.toISOString(),
                plan: mapPlan(plan),
                club: {
                    id: club.id,
                    name: club.name,
                    logoUrl: club.logoUrl,
                    slogan: club.slogan,
                },
            };
        })
            .filter((f) => f !== null);
    }
    async findByPlan(idSubscriptionTypes) {
        const favorites = await this.prisma.favorites.findMany({
            where: { idSubscriptionTypes },
            orderBy: { dateAdded: 'desc' },
        });
        return favorites.map(sanitize);
    }
    async findByPlanForRequester(idSubscriptionTypes, user) {
        if (user.role !== 'admin') {
            const plan = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
            if (!plan)
                throw new common_1.NotFoundException('Plan de suscripción no encontrado');
            const link = await this.prisma.entrepreneur_Club.findFirst({
                where: { idClub: plan.idClub, idEntrepreneurs: user.id },
            });
            if (!link)
                throw new common_1.ForbiddenException('No tenés acceso a este plan');
        }
        return this.findByPlan(idSubscriptionTypes);
    }
    async update(id, dto) {
        const favorite = await this.prisma.favorites.findUnique({ where: { id } });
        if (!favorite)
            throw new common_1.NotFoundException('Favorito no encontrado');
        const updated = await this.prisma.favorites.update({
            where: { id },
            data: {
                ...dto,
                dateAdded: dto.dateAdded ? new Date(dto.dateAdded) : favorite.dateAdded,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const favorite = await this.prisma.favorites.findUnique({ where: { id } });
        if (!favorite)
            throw new common_1.NotFoundException('Favorito no encontrado');
        await this.prisma.favorites.delete({ where: { id } });
        return { message: 'Favorito eliminado correctamente' };
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map