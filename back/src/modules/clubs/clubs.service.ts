import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

function sanitizeClub(club: any) {
  if (!club) return club;
  if (club.creationDate instanceof Date) {
    club.creationDate = club.creationDate.toISOString();
  }
  return club;
}

function computeRating(reviews: { rating: number }[]): { averageRating: number; totalReviews: number } {
  if (!reviews || reviews.length === 0) return { averageRating: 0, totalReviews: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    averageRating: Math.round((sum / reviews.length) * 10) / 10,
    totalReviews: reviews.length,
  };
}

@Injectable()
export class ClubsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(ownerId: number, dto: CreateClubDto, logoFile?: Express.Multer.File) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: ownerId } });
    if (!entrepreneur) throw new ForbiddenException('Solo entrepreneurs pueden crear clubs');

    let logoUrl = dto.logoUrl ?? '';
    if (logoFile) {
      logoUrl = await this.cloudinary.uploadImage(logoFile, 'aurabox/clubs/logos');
    }

    const club = await this.prisma.club.create({
      data: {
        name: dto.name,
        logoUrl,
        slogan: dto.slogan,
        history: dto.history,
        shortDescription: dto.shortDescription,
        contactEmail: dto.contactEmail,
        whatsappContact: dto.whatsappContact,
        clubStatus: dto.clubStatus ?? 'PENDIENTE_APROBACION',
      },
    });

    await this.prisma.entrepreneur_Club.create({
      data: { idEntrepreneurs: ownerId, idClub: club.id },
    });

    return sanitizeClub(club);
  }

  async findAll() {
    const clubs = await this.prisma.club.findMany({ orderBy: { creationDate: 'desc' } });
    const clubsWithRatings = await Promise.all(
      clubs.map(async (club) => {
        const reviews = await this.prisma.reviews.findMany({
          where: { idClub: club.id, active: true },
          select: { rating: true },
        });
        const { averageRating, totalReviews } = computeRating(reviews);
        return sanitizeClub({ ...club, averageRating, totalReviews });
      }),
    );
    return clubsWithRatings;
  }

  async findOne(id: number, requesterId?: number) {
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Club no encontrado');

    const reviews = await this.prisma.reviews.findMany({
      where: { idClub: id, active: true },
      select: { id: true, rating: true, title: true, comment: true, reviewDate: true, idUser: true },
      orderBy: { reviewDate: 'desc' },
      take: 10,
    });

    const { averageRating, totalReviews } = computeRating(reviews);

    const enrichedReviews = await Promise.all(
      reviews.map(async (r) => {
        const user = await this.prisma.user.findUnique({
          where: { id: r.idUser },
          select: { firstName: true, lastName: true },
        });
        return {
          ...r,
          reviewDate: r.reviewDate instanceof Date ? r.reviewDate.toISOString() : r.reviewDate,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Usuario',
        };
      }),
    );

    const socialNetworks = await this.prisma.club_Social_Networks.findMany({ where: { idClub: id } });

    const images = await this.prisma.image_Club.findMany({
      where: { idClub: id },
      orderBy: { uploadDate: 'desc' },
    });

    const subscriptionPlans = await this.prisma.subscription_Types.findMany({
      where: { idClub: id, active: true },
    });

    const clubPaymentMethods = await this.prisma.club_Payment_Method.findMany({ where: { idClub: id } });
    const paymentMethodIds = clubPaymentMethods.map((cpm) => cpm.idPaymentMethod);
    const paymentMethods = paymentMethodIds.length
      ? await this.prisma.payment_Methods.findMany({ where: { id: { in: paymentMethodIds }, active: true } })
      : [];

    const clubCategories = await this.prisma.club_Categories.findMany({ where: { idClub: id } });
    const categoryIds = clubCategories.map((cc) => cc.idCategories);
    const categories = categoryIds.length
      ? await this.prisma.categories.findMany({ where: { id: { in: categoryIds } } })
      : [];

    let isOwner = false;
    if (requesterId) {
      const association = await this.prisma.entrepreneur_Club.findFirst({
        where: { idEntrepreneurs: requesterId, idClub: id },
      });
      isOwner = !!association;
    }

    const entrepreneurAssociations = await this.prisma.entrepreneur_Club.findMany({
      where: { idClub: id },
    });

    const entrepreneurs = await Promise.all(
      entrepreneurAssociations.map(async (assoc) => {
        const e = await this.prisma.entrepreneurs.findUnique({
          where: { id: assoc.idEntrepreneurs },
          select: { id: true, firstName: true, lastName: true, bio: true },
        });
        return e ? { id: e.id, firstName: e.firstName, lastName: e.lastName, bio: e.bio } : null;
      }),
    );

    const socialMedia = socialNetworks.reduce((acc: Record<string, string>, sn) => {
      acc[sn.networkType.toLowerCase()] = sn.profileUrl;
      return acc;
    }, {});

    const bannerImages = images
      .filter((img) => img.contentType === 'Imagen' && img.description !== 'historia' && !img.description?.startsWith('team-'))
      .map((img) => img.imageUrl);

    const socialNetworksRaw = socialNetworks.map((sn) => ({
      id: sn.id,
      networkType: sn.networkType,
      profileUrl: sn.profileUrl,
    }));

    const mappedPlans = subscriptionPlans.map((plan) => ({
      planId: String(plan.id),
      name: plan.name,
      price: Number(plan.basePrice),
      currency: 'ARS',
      description: plan.description || '',
      deliveryFrequency: plan.frequency,
      includes: (() => {
        try { return plan.includes ? JSON.parse(plan.includes) : []; } catch { return []; }
      })(),
      shippingAreas: plan.shippingAreas || '',
      specifications: [],
      image: plan.imageUrl || '',
      cashDiscount: plan.cashDiscount ? Number(plan.cashDiscount) : undefined,
      transferDiscount: plan.transferDiscount ? Number(plan.transferDiscount) : undefined,
      active: plan.active,
    }));

    let parsedMilestones = [];
    try {
      parsedMilestones = club.milestones ? JSON.parse(club.milestones) : [];
    } catch {}

    return sanitizeClub({
      id: club.id,
      name: club.name,
      slogan: club.slogan,
      shortDescription: club.shortDescription,
      logoUrl: club.logoUrl,
      logoImage: club.logoUrl,
      history: club.history,
      fullHistory: club.history,
      contactEmail: club.contactEmail,
      whatsappContact: club.whatsappContact,
      clubStatus: club.clubStatus,
      creationDate: club.creationDate,
      averageRating,
      totalReviews,
      milestones: parsedMilestones,
      communityText: club.communityText || '',
      entrepreneurs: entrepreneurs.filter(Boolean),
      category: categories.map((c) => c.name).join(', ') || 'Sin categoría',
      bannerImages,
      bannerImagesRaw: images
        .filter((img) => img.contentType === 'Imagen' && img.description !== 'historia' && !img.description?.startsWith('team-'))
        .map((img) => ({ id: img.id, imageUrl: img.imageUrl, description: img.description })),
      historyImageRaw: images
        .filter((img) => img.description === 'historia' || img.description?.startsWith('team-'))
        .map((img) => ({ id: img.id, imageUrl: img.imageUrl, description: img.description })),
      mainImage: images.find((img) => img.contentType === 'Imagen' && img.description !== 'historia' && !img.description?.startsWith('team-'))?.imageUrl || null,
      socialMedia: Object.keys(socialMedia).length ? socialMedia : null,
      socialNetworksRaw,
      subscriptionPlans: mappedPlans,
      paymentMethods: paymentMethods.map((pm) => pm.method),
      featuredReviews: enrichedReviews,
      isOwner,
    });
  }

  async findFeatured() {
    const isDev = process.env.NODE_ENV !== 'production';
    const clubs = await this.prisma.club.findMany({
      where: {
        clubStatus: isDev
          ? { in: ['APROBADO', 'PENDIENTE_APROBACION'] }
          : 'APROBADO',
      },
    });
    const withRatings = await Promise.all(
      clubs.map(async (club) => {
        const reviews = await this.prisma.reviews.findMany({
          where: { idClub: club.id, active: true },
          select: { rating: true },
        });
        const { averageRating, totalReviews } = computeRating(reviews);
        return { ...club, averageRating, totalReviews };
      }),
    );
    const sorted = withRatings.sort((a, b) => {
      if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
      return b.totalReviews - a.totalReviews;
    });
    return sorted.slice(0, 5).map(sanitizeClub);
  }

  async update(id: number, userId: number, userRole: string, dto: UpdateClubDto) {
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Club no encontrado');
    if (userRole === 'entrepreneur') {
      const association = await this.prisma.entrepreneur_Club.findFirst({
        where: { idEntrepreneurs: userId, idClub: id },
      });
      if (!association) throw new ForbiddenException('No eres el owner de este club');
    } else if (userRole !== 'admin') {
      throw new ForbiddenException('No autorizado para editar clubes');
    }
    const updated = await this.prisma.club.update({ where: { id }, data: dto });
    return sanitizeClub(updated);
  }

  async updateLogo(id: number, userId: number, userRole: string, logoFile: Express.Multer.File) {
    if (!logoFile) throw new BadRequestException('Se requiere una imagen para el logo');

    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Club no encontrado');

    if (userRole === 'entrepreneur') {
      const association = await this.prisma.entrepreneur_Club.findFirst({
        where: { idEntrepreneurs: userId, idClub: id },
      });
      if (!association) throw new ForbiddenException('No eres el owner de este club');
    } else if (userRole !== 'admin') {
      throw new ForbiddenException('No autorizado para editar clubes');
    }

    if (club.logoUrl) {
      try {
        const publicId = this.cloudinary.extractPublicId(club.logoUrl);
        await this.cloudinary.deleteImage(publicId);
      } catch {}
    }

    const logoUrl = await this.cloudinary.uploadImage(logoFile, 'aurabox/clubs/logos');
    const updated = await this.prisma.club.update({ where: { id }, data: { logoUrl } });
    return sanitizeClub(updated);
  }

  async remove(id: number, userRole: string) {
    if (userRole !== 'admin') throw new ForbiddenException('Solo los administradores pueden eliminar clubes');
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Club no encontrado');
    await this.prisma.club.delete({ where: { id } });
    return { message: 'Club eliminado correctamente' };
  }

  async findClubByEntrepreneur(entrepreneurId: number) {
    const association = await this.prisma.entrepreneur_Club.findFirst({
      where: { idEntrepreneurs: entrepreneurId },
    });
    if (!association) return null;
    try {
      return await this.findOne(association.idClub, entrepreneurId);
    } catch {
      return null;
    }
  }
}