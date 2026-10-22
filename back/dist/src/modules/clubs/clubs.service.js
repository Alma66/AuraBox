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
exports.ClubsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const client_1 = require("@prisma/client");
let ClubsService = class ClubsService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async create(dto) {
        if (!dto.logoUrl) {
            throw new common_1.BadRequestException('logoUrl es requerido');
        }
        const data = {
            name: dto.name,
            logoUrl: dto.logoUrl,
            slogan: dto.slogan,
            history: dto.history,
            shortDescription: dto.shortDescription,
            contactEmail: dto.contactEmail,
            whatsappContact: dto.whatsappContact,
            milestones: dto.milestones,
            communityText: dto.communityText,
        };
        if (dto.clubStatus !== undefined) {
            data.clubStatus = dto.clubStatus;
        }
        return this.prisma.club.create({ data });
    }
    async findAll(filters) {
        const where = { clubStatus: 'APROBADO' };
        if (filters?.minRating) {
            where.averageRating = { gte: filters.minRating };
        }
        if (filters?.minReviews) {
            where.totalReviews = { gte: filters.minReviews };
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { shortDescription: { contains: filters.search, mode: 'insensitive' } },
                { slogan: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.categoryIds && filters.categoryIds.length > 0) {
            const relations = await this.prisma.club_Categories.findMany({
                where: { idCategories: { in: filters.categoryIds } },
                select: { idClub: true },
            });
            const matchingClubIds = Array.from(new Set(relations.map((r) => r.idClub)));
            if (matchingClubIds.length === 0)
                return [];
            where.id = { in: matchingClubIds };
        }
        const clubs = await this.prisma.club.findMany({ where, orderBy: { creationDate: 'desc' } });
        return this.attachCategories(clubs);
    }
    async attachCategories(clubs) {
        const clubIds = clubs.map((c) => c.id);
        if (clubIds.length === 0)
            return [];
        const links = await this.prisma.club_Categories.findMany({ where: { idClub: { in: clubIds } } });
        const categoryIds = Array.from(new Set(links.map((l) => l.idCategories)));
        const categories = categoryIds.length > 0
            ? await this.prisma.categories.findMany({ where: { id: { in: categoryIds } } })
            : [];
        const categoryMap = new Map(categories.map((c) => [c.id, c]));
        return clubs.map((club) => {
            const clubLinks = links.filter((l) => l.idClub === club.id);
            const clubCategories = clubLinks
                .map((l) => categoryMap.get(l.idCategories))
                .filter((c) => Boolean(c))
                .map((c) => ({ id: c.id, name: c.name }));
            return { ...this.sanitizeClub(club), categories: clubCategories };
        });
    }
    async findFeatured() {
        const clubs = await this.prisma.club.findMany({
            where: { clubStatus: 'APROBADO' },
            orderBy: { averageRating: 'desc' },
            take: 12,
        });
        return clubs.map((c) => this.sanitizeClub(c));
    }
      async findOne(id: number, requester?: number | { id: number; role: string }) {
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Club no encontrado');
    const entrepreneurClub = await this.prisma.entrepreneur_Club.findMany({
      where: { idClub: id },
    });
    const entrepreneurIds = entrepreneurClub.map((ec) => ec.idEntrepreneurs);
    let isOwner = false;
    if (typeof requester === 'number') {
      isOwner = entrepreneurIds.includes(requester);
    } else if (requester && requester.role === 'entrepreneur') {
      isOwner = entrepreneurIds.includes(requester.id);
    }
    const entrepreneurs = await this.prisma.entrepreneurs.findMany({
      where: { id: { in: entrepreneurIds } },
      select: { id: true, firstName: true, lastName: true, bio: true },
    });
    const images = await this.prisma.image_Club.findMany({
      where: { idClub: id },
      orderBy: { id: 'desc' },
    });
    const isTeamImage = (img: { description: string | null }) =>
      (img.description ?? '').startsWith('team-');
    const bannerImagesRaw = images.filter(
      (img) =>
        img.section === 'Banner' &&
        img.isActive &&
        img.description !== 'historia' &&
        !isTeamImage(img),
    );
    const historyImageRaw = images.filter(
      (img) => img.section === 'Historia' && img.isActive && !isTeamImage(img),
    );
    const socialNetworksRaw = await this.prisma.club_Social_Networks.findMany({ where: { idClub: id } });
    const plans = await this.prisma.subscription_Types.findMany({ where: { idClub: id } });
    const mappedPlans = plans.map((p) => this.mapPlan(p));
    const categoryLinks = await this.prisma.club_Categories.findMany({ where: { idClub: id } });
    const categoryIds = categoryLinks.map((l) => l.idCategories);
    const categories = categoryIds.length > 0
      ? await this.prisma.categories.findMany({ where: { id: { in: categoryIds } } })
      : [];
    return {
      ...this.sanitizeClub(club),
      isOwner,
      entrepreneurs,
      bannerImagesRaw,
      historyImageRaw,
      socialNetworksRaw,
      subscriptionPlans: mappedPlans,
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
    };
  }
      async update(id, dto, entrepreneurId) {
        await this.assertOwnership(id, entrepreneurId);
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.slogan !== undefined)
            data.slogan = dto.slogan;
        if (dto.history !== undefined)
            data.history = dto.history;
        if (dto.shortDescription !== undefined)
            data.shortDescription = dto.shortDescription;
        if (dto.contactEmail !== undefined)
            data.contactEmail = dto.contactEmail;
        if (dto.whatsappContact !== undefined)
            data.whatsappContact = dto.whatsappContact;
        if (dto.communityText !== undefined)
            data.communityText = dto.communityText;
        if (dto.milestones !== undefined)
            data.milestones = dto.milestones;
        try {
            const updated = await this.prisma.club.update({ where: { id }, data });
            return this.sanitizeClub(updated);
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                throw new common_1.NotFoundException('Club no encontrado');
            }
            throw err;
        }
    }
    async updateLogo(id, file, entrepreneurId) {
        await this.assertOwnership(id, entrepreneurId);
        const club = await this.prisma.club.findUnique({ where: { id } });
        if (!club)
            throw new common_1.NotFoundException('Club no encontrado');
        if (club.logoUrl) {
            try {
                const publicId = this.cloudinaryService.extractPublicId(club.logoUrl);
                await this.cloudinaryService.deleteImage(publicId);
            }
            catch { }
        }
        const secureUrl = await this.cloudinaryService.uploadImage(file, 'aurabox/clubs/logos');
        const updated = await this.prisma.club.update({
            where: { id },
            data: { logoUrl: secureUrl },
        });
        return this.sanitizeClub(updated);
    }
    async remove(id) {
        try {
            await this.prisma.club.delete({ where: { id } });
            return { ok: true };
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                throw new common_1.NotFoundException('Club no encontrado');
            }
            throw err;
        }
    }
    async findSubscriptionsByClub(clubId, entrepreneurId) {
        await this.assertOwnership(clubId, entrepreneurId);
        const plans = await this.prisma.subscription_Types.findMany({
            where: { idClub: clubId },
            select: { id: true },
        });
        const planIds = plans.map((p) => p.id);
        if (planIds.length === 0)
            return [];
        const subs = await this.prisma.user_Subscriptions.findMany({
            where: { idSubscriptionTypes: { in: planIds } },
            orderBy: { startDate: 'desc' },
        });
        return subs.map((s) => this.sanitizeSubscription(s));
    }
    async findCustomersByClub(clubId, entrepreneurId) {
        await this.assertOwnership(clubId, entrepreneurId);
        const plans = await this.prisma.subscription_Types.findMany({
            where: { idClub: clubId },
            select: { id: true },
        });
        const planIds = plans.map((p) => p.id);
        if (planIds.length === 0)
            return [];
        const subs = await this.prisma.user_Subscriptions.findMany({
            where: { idSubscriptionTypes: { in: planIds } },
            select: { idUser: true },
            distinct: ['idUser'],
        });
        const userIds = subs.map((s) => s.idUser);
        if (userIds.length === 0)
            return [];
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                streetAddress: true,
                addressNumber: true,
                floorNumber: true,
                addressDetails: true,
                city: true,
                province: true,
                postalCode: true,
                active: true,
                registrationDate: true,
                birthDate: true,
            },
        });
        return users.map((u) => ({
            ...u,
            registrationDate: u.registrationDate.toISOString(),
            birthDate: u.birthDate ? u.birthDate.toISOString() : null,
        }));
    }
    async findClubByEntrepreneur(entrepreneurId) {
        const association = await this.prisma.entrepreneur_Club.findFirst({
            where: { idEntrepreneurs: entrepreneurId },
            orderBy: { associationDate: 'asc' },
        });
        if (!association)
            return null;
        const club = await this.prisma.club.findUnique({ where: { id: association.idClub } });
        if (!club)
            return null;
        return this.sanitizeClub(club);
    }
    async assertOwnership(clubId, entrepreneurId) {
        const ec = await this.prisma.entrepreneur_Club.findFirst({
            where: { idClub: clubId, idEntrepreneurs: entrepreneurId },
        });
        if (!ec)
            throw new common_1.ForbiddenException('No tenés acceso a este club');
        return ec;
    }
    mapPlan(p) {
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
            shippingAreas: p.shippingAreas,
            active: p.active,
            cashDiscount: p.cashDiscount ? Number(p.cashDiscount) : 0,
            transferDiscount: p.transferDiscount ? Number(p.transferDiscount) : 0,
        };
    }
    sanitizeClub(club) {
        if (!club)
            return club;
        const sanitized = { ...club };
        if (sanitized.creationDate instanceof Date) {
            sanitized.creationDate = sanitized.creationDate.toISOString();
        }
        if (sanitized.averageRating !== undefined && sanitized.averageRating !== null) {
            try {
                sanitized.averageRating = sanitized.averageRating.toString();
            }
            catch { }
        }
        return sanitized;
    }
    sanitizeSubscription(sub) {
        if (!sub)
            return sub;
        const sanitized = { ...sub };
        if (sanitized.monthlyAmountPaid !== undefined && sanitized.monthlyAmountPaid !== null) {
            try {
                sanitized.monthlyAmountPaid = sanitized.monthlyAmountPaid.toString();
            }
            catch { }
        }
        ['startDate', 'expectedEndDate', 'lastPaymentDate', 'nextPaymentDate', 'cancellationDate'].forEach((k) => {
            if (sanitized[k] instanceof Date)
                sanitized[k] = sanitized[k].toISOString();
        });
        return sanitized;
    }
};
exports.ClubsService = ClubsService;
exports.ClubsService = ClubsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], ClubsService);
//# sourceMappingURL=clubs.service.js.map