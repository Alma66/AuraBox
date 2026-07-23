import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';

interface FindAllFilters {
  search?: string;
  categoryIds?: number[];
  minRating?: number;
  minReviews?: number;
}

@Injectable()
export class ClubsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private readonly categoryAffinity: Record<string, string[]> = {
    'café': ['libros', 'té', 'repostería', 'gourmet'],
    'libros': ['café', 'té', 'arte'],
    'té': ['libros', 'café', 'bienestar'],
    'vinos': ['quesos', 'gourmet', 'chocolate'],
    'quesos': ['vinos', 'gourmet'],
    'gourmet': ['vinos', 'quesos', 'café'],
    'belleza': ['bienestar', 'aromaterapia'],
    'bienestar': ['belleza', 'plantas', 'té'],
    'plantas': ['bienestar', 'decoración'],
    'mascotas': ['bienestar'],
  };

  async create(dto: CreateClubDto) {
    if (!dto.logoUrl) {
      throw new BadRequestException('logoUrl es requerido');
    }
    const data: Prisma.ClubCreateInput = {
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

  async findAll(filters?: FindAllFilters) {
    const where: Prisma.ClubWhereInput = { clubStatus: 'APROBADO' };

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
      if (matchingClubIds.length === 0) return [];
      where.id = { in: matchingClubIds };
    }

    const clubs = await this.prisma.club.findMany({ where, orderBy: { creationDate: 'desc' } });
    return this.attachCategories(clubs);
  }

  private async attachCategories(clubs: any[]) {
    const clubIds = clubs.map((c) => c.id);
    if (clubIds.length === 0) return [];
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
        .map((c: any) => ({ id: c.id, name: c.name }));
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

  async getRecommendationsForUser(userId: number) {
    const activeSubs = await this.prisma.user_Subscriptions.findMany({
      where: { idUser: userId, subscriptionStatus: { in: ['Activa', 'Pausada'] as any } },
      select: { idSubscriptionTypes: true },
    });
    const subTypeIds = activeSubs.map((s) => s.idSubscriptionTypes);
    const subTypes = subTypeIds.length > 0
      ? await this.prisma.subscription_Types.findMany({ where: { id: { in: subTypeIds } } })
      : [];
    const subscribedClubIds = Array.from(new Set(subTypes.map((s) => s.idClub)));

    const subscribedClubCategoryLinks = subscribedClubIds.length > 0
      ? await this.prisma.club_Categories.findMany({ where: { idClub: { in: subscribedClubIds } } })
      : [];
    const subscribedCategoryIds = Array.from(new Set(subscribedClubCategoryLinks.map((l) => l.idCategories)));

    const preferenceLinks = await this.prisma.user_Category_Preference.findMany({ where: { idUser: userId } });
    const preferredCategoryIds = preferenceLinks.map((p) => p.idCategory);

    const relevantCategoryIds = Array.from(new Set([...subscribedCategoryIds, ...preferredCategoryIds]));
    const allRelevantCategories = relevantCategoryIds.length > 0
      ? await this.prisma.categories.findMany({ where: { id: { in: relevantCategoryIds } } })
      : [];
    const categoryNameById = new Map(allRelevantCategories.map((c) => [c.id, c.name.toLowerCase()]));

    const subscribedCategoryNames = new Set(
      subscribedCategoryIds.map((id) => categoryNameById.get(id)).filter(Boolean) as string[],
    );
    const preferredCategoryNames = new Set(
      preferredCategoryIds.map((id) => categoryNameById.get(id)).filter(Boolean) as string[],
    );

    const affineNames = new Set<string>();
    [...subscribedCategoryNames, ...preferredCategoryNames].forEach((name) => {
      const related = this.categoryAffinity[name];
      if (related) related.forEach((r) => affineNames.add(r));
    });

    const candidateClubs = await this.prisma.club.findMany({
      where: {
        clubStatus: 'APROBADO',
        id: subscribedClubIds.length > 0 ? { notIn: subscribedClubIds } : undefined,
      },
      orderBy: { averageRating: 'desc' },
    });

    if (candidateClubs.length === 0) return [];

    const candidateIds = candidateClubs.map((c) => c.id);
    const candidateLinks = await this.prisma.club_Categories.findMany({ where: { idClub: { in: candidateIds } } });
    const candidateCategoryIds = Array.from(new Set(candidateLinks.map((l) => l.idCategories)));
    const candidateCategories = candidateCategoryIds.length > 0
      ? await this.prisma.categories.findMany({ where: { id: { in: candidateCategoryIds } } })
      : [];
    const candidateCategoryNameById = new Map(candidateCategories.map((c) => [c.id, c.name.toLowerCase()]));

    const sameCategoryBucket: any[] = [];
    const otherBucket: any[] = [];

    for (const club of candidateClubs) {
      const links = candidateLinks.filter((l) => l.idClub === club.id);
      const names = links.map((l) => candidateCategoryNameById.get(l.idCategories)).filter(Boolean) as string[];
      const isSameAsSubscribed = names.some((n) => subscribedCategoryNames.has(n));
      const matchesPreferred = names.some((n) => preferredCategoryNames.has(n));
      const matchesAffinity = names.some((n) => affineNames.has(n));
      const rating = club.averageRating ? Number(club.averageRating) : 0;
      let score = rating * 0.5;
      if (matchesPreferred) score += 3;
      if (matchesAffinity) score += 2;

      const enriched = { ...this.sanitizeClub(club), categories: names, score };
      if (isSameAsSubscribed) sameCategoryBucket.push(enriched);
      else otherBucket.push(enriched);
    }

    sameCategoryBucket.sort((a, b) => b.score - a.score);
    otherBucket.sort((a, b) => b.score - a.score);

    return [...sameCategoryBucket.slice(0, 2), ...otherBucket].slice(0, 10);
  }

  async findOne(id: number, requestingUserId?: number) {
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Club no encontrado');
    const entrepreneurClub = await this.prisma.entrepreneur_Club.findMany({
      where: { idClub: id },
    });
    const entrepreneurIds = entrepreneurClub.map((ec) => ec.idEntrepreneurs);
    let isOwner = false;
    if (requestingUserId) {
      isOwner = entrepreneurIds.includes(requestingUserId);
    }
    const entrepreneurs = await this.prisma.entrepreneurs.findMany({
      where: { id: { in: entrepreneurIds } },
      select: { id: true, firstName: true, lastName: true, bio: true },
    });
    const images = await this.prisma.image_Club.findMany({
      where: { idClub: id },
      orderBy: { id: 'desc' },
    });
    const bannerImagesRaw = images.filter(
      (img) => img.section === 'Banner' && img.description !== 'historia' && !(img.description ?? '').startsWith('team-'),
    );
    const historyImageRaw = images.filter((img) => img.section === 'Historia' && img.description === 'historia');
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

  async update(id: number, dto: UpdateClubDto, entrepreneurId: number) {
    await this.assertOwnership(id, entrepreneurId);
    const data: Prisma.ClubUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slogan !== undefined) data.slogan = dto.slogan;
    if (dto.history !== undefined) data.history = dto.history;
    if (dto.shortDescription !== undefined) data.shortDescription = dto.shortDescription;
    if (dto.contactEmail !== undefined) data.contactEmail = dto.contactEmail;
    if (dto.whatsappContact !== undefined) data.whatsappContact = dto.whatsappContact;
    if (dto.communityText !== undefined) data.communityText = dto.communityText;
    if (dto.milestones !== undefined) data.milestones = dto.milestones;
    if (dto.shippingWindowStartDay !== undefined) data.shippingWindowStartDay = dto.shippingWindowStartDay;
    if (dto.shippingWindowEndDay !== undefined) data.shippingWindowEndDay = dto.shippingWindowEndDay;
    try {
      const updated = await this.prisma.club.update({ where: { id }, data });
      return this.sanitizeClub(updated);
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('Club no encontrado');
      }
      throw err;
    }
  }

  async updateLogo(id: number, file: Express.Multer.File, entrepreneurId: number) {
    await this.assertOwnership(id, entrepreneurId);
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Club no encontrado');

    const secureUrl = await this.cloudinaryService.uploadImage(file, 'aurabox/clubs/logos');

    const updated = await this.prisma.club.update({
      where: { id },
      data: { logoUrl: secureUrl },
    });

    await this.prisma.image_Club.updateMany({
      where: { idClub: id, section: 'Logo', isActive: true },
      data: { isActive: false },
    });

    await this.prisma.image_Club.create({
      data: {
        idClub: id,
        imageUrl: secureUrl,
        contentType: 'Imagen',
        section: 'Logo',
        isActive: true,
        uploadedBy: entrepreneurId,
      },
    });

    return this.sanitizeClub(updated);
  }

  async remove(id: number) {
    try {
      await this.prisma.club.delete({ where: { id } });
      return { ok: true };
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('Club no encontrado');
      }
      throw err;
    }
  }

  async findSubscriptionsByClub(clubId: number, entrepreneurId: number) {
    await this.assertOwnership(clubId, entrepreneurId);
    const plans = await this.prisma.subscription_Types.findMany({
      where: { idClub: clubId },
      select: { id: true },
    });
    const planIds = plans.map((p) => p.id);
    if (planIds.length === 0) return [];
    const subs = await this.prisma.user_Subscriptions.findMany({
      where: { idSubscriptionTypes: { in: planIds } },
      orderBy: { startDate: 'desc' },
    });
    return subs.map((s) => this.sanitizeSubscription(s));
  }

  async findCustomersByClub(clubId: number, entrepreneurId: number) {
    await this.assertOwnership(clubId, entrepreneurId);
    const plans = await this.prisma.subscription_Types.findMany({
      where: { idClub: clubId },
      select: { id: true },
    });
    const planIds = plans.map((p) => p.id);
    if (planIds.length === 0) return [];
    const subs = await this.prisma.user_Subscriptions.findMany({
      where: { idSubscriptionTypes: { in: planIds } },
      select: { idUser: true },
      distinct: ['idUser'],
    });
    const userIds = subs.map((s) => s.idUser);
    if (userIds.length === 0) return [];
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

  async findClubByEntrepreneur(entrepreneurId: number) {
    const association = await this.prisma.entrepreneur_Club.findFirst({
      where: { idEntrepreneurs: entrepreneurId },
      orderBy: { associationDate: 'asc' },
    });
    if (!association) return null;
    const club = await this.prisma.club.findUnique({ where: { id: association.idClub } });
    if (!club) return null;
    return this.sanitizeClub(club);
  }

  async assertOwnership(clubId: number, entrepreneurId: number) {
    const ec = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub: clubId, idEntrepreneurs: entrepreneurId },
    });
    if (!ec) throw new ForbiddenException('No tenés acceso a este club');
    return ec;
  }

  private mapPlan(p: any) {
    let includes: string[] = [];
    if (p.includes) {
      try {
        includes = JSON.parse(p.includes);
      } catch {
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

  private sanitizeClub(club: any) {
    if (!club) return club;
    const sanitized = { ...club };
    if (sanitized.creationDate instanceof Date) {
      sanitized.creationDate = sanitized.creationDate.toISOString();
    }
    if (sanitized.averageRating !== undefined && sanitized.averageRating !== null) {
      try {
        sanitized.averageRating = sanitized.averageRating.toString();
      } catch {}
    }
    if (typeof sanitized.milestones === 'string') {
      try {
        sanitized.milestones = JSON.parse(sanitized.milestones);
      } catch {
        sanitized.milestones = [];
      }
    } else if (!sanitized.milestones) {
      sanitized.milestones = [];
    }
    return sanitized;
  }

  private sanitizeSubscription(sub: any) {
    if (!sub) return sub;
    const sanitized = { ...sub };
    if (sanitized.monthlyAmountPaid !== undefined && sanitized.monthlyAmountPaid !== null) {
      try {
        sanitized.monthlyAmountPaid = sanitized.monthlyAmountPaid.toString();
      } catch {}
    }
    ['startDate', 'expectedEndDate', 'lastPaymentDate', 'nextPaymentDate', 'cancellationDate'].forEach((k) => {
      if (sanitized[k] instanceof Date) sanitized[k] = sanitized[k].toISOString();
    });
    return sanitized;
  }
}