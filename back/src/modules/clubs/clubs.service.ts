import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClubsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  async findAll() {
    return this.prisma.club.findMany({ orderBy: { creationDate: 'desc' } });
  }

  async findFeatured() {
    const clubs = await this.prisma.club.findMany({
      where: { clubStatus: 'APROBADO' },
      orderBy: { averageRating: 'desc' },
      take: 12,
    });
    return clubs.map((c) => this.sanitizeClub(c));
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

    const images = await this.prisma.image_Club.findMany({ where: { idClub: id } });

    const bannerImagesRaw = images.filter(
      (img) => img.description !== 'historia' && !(img.description ?? '').startsWith('team-'),
    );
    const historyImageRaw = images.filter((img) => img.description === 'historia');

    const socialNetworksRaw = await this.prisma.club_Social_Networks.findMany({ where: { idClub: id } });

    const plans = await this.prisma.subscription_Types.findMany({ where: { idClub: id } });
    const mappedPlans = plans.map((p) => this.mapPlan(p));

    return {
      ...this.sanitizeClub(club),
      isOwner,
      entrepreneurs,
      bannerImagesRaw,
      historyImageRaw,
      socialNetworksRaw,
      subscriptionPlans: mappedPlans,
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

    if (club.logoUrl) {
      try {
        const publicId = this.cloudinaryService.extractPublicId(club.logoUrl);
        await this.cloudinaryService.deleteImage(publicId);
      } catch {}
    }

    const secureUrl = await this.cloudinaryService.uploadImage(file, 'aurabox/clubs/logos');

    const updated = await this.prisma.club.update({
      where: { id },
      data: { logoUrl: secureUrl },
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

  private async assertOwnership(clubId: number, entrepreneurId: number) {
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