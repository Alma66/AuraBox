import { Injectable } from '@nestjs/common';
import { Frequency } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface ClubSearchFilters {
  categoryId: number | null;
  keywords: string[];
  maxPrice: number | null;
  frequency: Frequency | null;
}

export interface ClubCard {
  id: number;
  name: string;
  logoUrl: string | null;
  slogan: string | null;
  rating: number | null;
  totalReviews: number;
  fromPrice: number;
  frequencies: string[];
  categories: string[];
}

const MAX_CLUBS = 200;
const MAX_RESULTS = 4;

const normalize = (text: string | null | undefined) =>
  (text ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

@Injectable()
export class ClubSearchService {
  constructor(private readonly prisma: PrismaService) {}

  listCategories() {
    return this.prisma.categories.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
  }

  async search(filters: ClubSearchFilters): Promise<ClubCard[]> {
    const clubs = await this.prisma.club.findMany({
      where: { clubStatus: 'APROBADO' },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        slogan: true,
        shortDescription: true,
        averageRating: true,
        totalReviews: true,
      },
      take: MAX_CLUBS,
    });
    if (clubs.length === 0) return [];

    const clubIds = clubs.map((club) => club.id);

    const [plans, links, categories] = await Promise.all([
      this.prisma.subscription_Types.findMany({
        where: {
          idClub: { in: clubIds },
          active: true,
          ...(filters.frequency ? { frequency: filters.frequency } : {}),
          ...(filters.maxPrice !== null ? { basePrice: { lte: filters.maxPrice } } : {}),
        },
        select: {
          idClub: true,
          name: true,
          description: true,
          includes: true,
          basePrice: true,
          frequency: true,
        },
      }),
      this.prisma.club_Categories.findMany({ where: { idClub: { in: clubIds } } }),
      this.prisma.categories.findMany({ select: { id: true, name: true } }),
    ]);

    const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
    const keywords = filters.keywords.map(normalize).filter((keyword) => keyword.length > 0);
    const hasTextCriteria = filters.categoryId !== null || keywords.length > 0;

    const scored: { card: ClubCard; score: number }[] = [];

    for (const club of clubs) {
      const clubPlans = plans.filter((plan) => plan.idClub === club.id);
      if (clubPlans.length === 0) continue;

      const clubCategoryIds = links.filter((link) => link.idClub === club.id).map((link) => link.idCategories);

      let score = 0;
      if (filters.categoryId !== null && clubCategoryIds.includes(filters.categoryId)) score += 3;

      const clubText = normalize(`${club.name} ${club.slogan ?? ''} ${club.shortDescription ?? ''}`);
      const planText = normalize(
        clubPlans.map((plan) => `${plan.name} ${plan.description ?? ''} ${plan.includes ?? ''}`).join(' '),
      );
      for (const keyword of keywords) {
        if (clubText.includes(keyword)) score += 2;
        if (planText.includes(keyword)) score += 2;
      }

      if (hasTextCriteria && score === 0) continue;

      const prices = clubPlans.map((plan) => Number(plan.basePrice));
      scored.push({
        score,
        card: {
          id: club.id,
          name: club.name,
          logoUrl: club.logoUrl ?? null,
          slogan: club.slogan ?? null,
          rating: club.averageRating === null ? null : Number(club.averageRating),
          totalReviews: club.totalReviews,
          fromPrice: Math.min(...prices),
          frequencies: Array.from(new Set(clubPlans.map((plan) => String(plan.frequency)))),
          categories: clubCategoryIds
            .map((id) => categoryNames.get(id))
            .filter((name): name is string => Boolean(name)),
        },
      });
    }

    scored.sort(
      (a, b) =>
        b.score - a.score ||
        (b.card.rating ?? 0) - (a.card.rating ?? 0) ||
        b.card.totalReviews - a.card.totalReviews,
    );

    return scored.slice(0, MAX_RESULTS).map((item) => item.card);
  }
}