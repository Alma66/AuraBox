import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateForbiddenWordDto } from './dto/create-forbidden-word.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ContentType } from '@prisma/client';

const MAX_MEDIA_PER_REVIEW = 5;
const REVIEW_WINDOW_AFTER_CANCEL_DAYS = 30;

type RequestUser = { id: number; role: string };

function sanitize(review: any) {
  if (!review) return review;
  if (review.reviewDate instanceof Date) review.reviewDate = review.reviewDate.toISOString();
  if (review.lastEditDate instanceof Date) review.lastEditDate = review.lastEditDate.toISOString();
  return review;
}

function mediaTypeFromMime(mimetype: string): ContentType {
  if (mimetype.startsWith('video/')) return 'Video' as ContentType;
  return 'Imagen' as ContentType;
}

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async assertClubAccess(idClub: number, user: RequestUser) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  private async matchesForbiddenWord(idClub: number, text: string) {
    const words = await this.prisma.forbidden_Word.findMany({ where: { idClub, active: true } });
    const lower = text.toLowerCase();
    return words.some((w) => lower.includes(w.word.toLowerCase()));
  }

  private async attachCustomerNames(reviews: any[]) {
    const userIds = Array.from(new Set(reviews.map((r) => r.idUser)));
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    return reviews.map((r) => {
      const customer = users.find((u) => u.id === r.idUser);
      return {
        ...sanitize(r),
        customerFirstName: customer?.firstName ?? null,
        customerLastName: customer?.lastName ?? null,
      };
    });
  }

  async checkEligibility(idUser: number, idSubscriptionTypes: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - REVIEW_WINDOW_AFTER_CANCEL_DAYS);

    const subscription = await this.prisma.user_Subscriptions.findFirst({
      where: {
        idUser,
        idSubscriptionTypes,
        OR: [
          { subscriptionStatus: 'Activa' as any },
          { subscriptionStatus: 'Cancelada' as any, cancellationDate: { gte: cutoff } },
        ],
      },
      orderBy: { startDate: 'desc' },
    });

    const existingReview = await this.prisma.reviews.findFirst({
      where: { idUser, idSubscriptionTypes },
    });

    return {
      eligible: !!subscription && !existingReview,
      alreadyReviewed: !!existingReview,
      hasEligibleSubscription: !!subscription,
    };
  }

  async create(dto: CreateReviewDto, idUser: number) {
    const user = await this.prisma.user.findUnique({ where: { id: idUser } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const subscriptionType = await this.prisma.subscription_Types.findUnique({
      where: { id: dto.idSubscriptionTypes },
    });
    if (!subscriptionType) throw new NotFoundException('Tipo de suscripción no encontrado');

    const { eligible, alreadyReviewed, hasEligibleSubscription } = await this.checkEligibility(
      idUser,
      dto.idSubscriptionTypes,
    );
    if (alreadyReviewed) throw new BadRequestException('Ya reseñaste esta suscripción');
    if (!hasEligibleSubscription) {
      throw new ForbiddenException(
        `Solo podés reseñar suscripciones activas o canceladas en los últimos ${REVIEW_WINDOW_AFTER_CANCEL_DAYS} días`,
      );
    }
    if (!eligible) throw new ForbiddenException('No estás habilitado para reseñar esta suscripción');

    const forbiddenMatch = await this.matchesForbiddenWord(
      subscriptionType.idClub,
      `${dto.title ?? ''} ${dto.comment ?? ''}`,
    );

    const created = await this.prisma.reviews.create({
      data: {
        idUser,
        idClub: subscriptionType.idClub,
        idSubscriptionTypes: dto.idSubscriptionTypes,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        reviewDate: new Date(),
        active: true,
        isHidden: forbiddenMatch,
        hiddenReason: forbiddenMatch ? 'Contiene palabra filtrada automáticamente' : null,
      },
      include: { media: true },
    });
    return sanitize(created);
  }

  async addMedia(reviewId: number, files: Express.Multer.File[], requesterId: number) {
    const review = await this.prisma.reviews.findUnique({
      where: { id: reviewId },
      include: { media: true },
    });
    if (!review) throw new NotFoundException('Reseña no encontrada');
    if (review.idUser !== requesterId) throw new ForbiddenException('No autorizado');

    const currentCount = review.media.length;
    if (currentCount + files.length > MAX_MEDIA_PER_REVIEW) {
      throw new BadRequestException(`Como máximo se permiten ${MAX_MEDIA_PER_REVIEW} archivos por reseña`);
    }

    let order = currentCount;
    for (const file of files) {
      const type = mediaTypeFromMime(file.mimetype);
      const url = type === ('Video' as ContentType)
        ? await this.cloudinary.uploadVideo(file, 'aurabox/reviews')
        : await this.cloudinary.uploadImage(file, 'aurabox/reviews');
      await this.prisma.review_Media.create({
        data: { idReview: reviewId, mediaUrl: url, mediaType: type, order },
      });
      order += 1;
    }

    return this.findOne(reviewId);
  }

  async removeMedia(reviewId: number, mediaId: number, requesterId: number) {
    const review = await this.prisma.reviews.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Reseña no encontrada');
    if (review.idUser !== requesterId) throw new ForbiddenException('No autorizado');

    const media = await this.prisma.review_Media.findUnique({ where: { id: mediaId } });
    if (!media || media.idReview !== reviewId) throw new NotFoundException('Archivo no encontrado');

    try {
      const publicId = this.cloudinary.extractPublicId(media.mediaUrl);
      await this.cloudinary.deleteImage(publicId, media.mediaType === ('Video' as ContentType) ? 'video' : 'image');
    } catch {}

    await this.prisma.review_Media.delete({ where: { id: mediaId } });
    return this.findOne(reviewId);
  }

  async findAll() {
    const reviews = await this.prisma.reviews.findMany({
      orderBy: { reviewDate: 'desc' },
      include: { media: true },
    });
    return reviews.map(sanitize);
  }

  async findOne(id: number) {
    const review = await this.prisma.reviews.findUnique({ where: { id }, include: { media: true } });
    if (!review) throw new NotFoundException('Reseña no encontrada');
    return sanitize(review);
  }

  async findOneForRequester(id: number, user: RequestUser) {
    const review = await this.findOne(id);
    if (!review.isHidden) return review;
    if (user.role === 'admin') return review;
    if (user.role === 'customer' && review.idUser === user.id) return review;
    if (user.role === 'entrepreneur') {
      await this.assertClubAccess(review.idClub, user);
      return review;
    }
    throw new ForbiddenException('No autorizado para ver esta reseña');
  }

  async findByUser(idUser: number) {
    const reviews = await this.prisma.reviews.findMany({
      where: { idUser },
      orderBy: { reviewDate: 'desc' },
      include: { media: true },
    });
    return reviews.map(sanitize);
  }

  async findByClub(idClub: number, includeHidden = false) {
    const reviews = await this.prisma.reviews.findMany({
      where: { idClub, ...(includeHidden ? {} : { isHidden: false }) },
      orderBy: { reviewDate: 'desc' },
      include: { media: true },
    });
    return this.attachCustomerNames(reviews);
  }

  async findBySubscriptionType(idSubscriptionTypes: number, limit = 10, offset = 0) {
    const [reviews, total] = await Promise.all([
      this.prisma.reviews.findMany({
        where: { idSubscriptionTypes, isHidden: false },
        orderBy: { reviewDate: 'desc' },
        include: { media: true },
        take: limit,
        skip: offset,
      }),
      this.prisma.reviews.count({ where: { idSubscriptionTypes, isHidden: false } }),
    ]);
    return { reviews: reviews.map(sanitize), total };
  }

  async findHiddenByClub(idClub: number) {
    const reviews = await this.prisma.reviews.findMany({
      where: { idClub, isHidden: true },
      orderBy: { reviewDate: 'desc' },
      include: { media: true },
    });
    return this.attachCustomerNames(reviews);
  }

  async getSummaryByClub(idClub: number) {
    const agg = await this.prisma.reviews.aggregate({
      where: { idClub, isHidden: false, active: true },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return { average: agg._avg.rating ?? 0, count: agg._count.rating };
  }

  async getSummaryBySubscriptionType(idSubscriptionTypes: number) {
    const agg = await this.prisma.reviews.aggregate({
      where: { idSubscriptionTypes, isHidden: false, active: true },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return { average: agg._avg.rating ?? 0, count: agg._count.rating };
  }

  async updateForRequester(id: number, dto: UpdateReviewDto, user: RequestUser) {
    const review = await this.findOne(id);
    const isOwner = user.role === 'customer' && user.id === review.idUser;

    if (isOwner) {
      const { isHidden, hiddenReason, ...ownerFields } = dto;
      const data: Partial<UpdateReviewDto> = { ...ownerFields };
      if (ownerFields.title !== undefined || ownerFields.comment !== undefined) {
        const newTitle = ownerFields.title ?? review.title;
        const newComment = ownerFields.comment ?? review.comment;
        const forbidden = await this.matchesForbiddenWord(review.idClub, `${newTitle ?? ''} ${newComment ?? ''}`);
        if (forbidden) {
          (data as any).isHidden = true;
          (data as any).hiddenReason = 'Contiene palabra filtrada automáticamente';
        }
      }
      return this.update(id, data);
    }

    if (user.role === 'admin') return this.update(id, dto);

    if (user.role === 'entrepreneur') {
      await this.assertClubAccess(review.idClub, user);
      const { rating, title, comment, ...moderationFields } = dto;
      return this.update(id, moderationFields);
    }

    throw new ForbiddenException('No autorizado para editar esta reseña');
  }

  async update(id: number, dto: Partial<UpdateReviewDto>) {
    const review = await this.prisma.reviews.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Reseña no encontrada');

    const updated = await this.prisma.reviews.update({
      where: { id },
      data: { ...dto, lastEditDate: new Date() },
      include: { media: true },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const review = await this.prisma.reviews.findUnique({ where: { id }, include: { media: true } });
    if (!review) throw new NotFoundException('Reseña no encontrada');

    for (const media of review.media) {
      try {
        const publicId = this.cloudinary.extractPublicId(media.mediaUrl);
        await this.cloudinary.deleteImage(publicId, media.mediaType === ('Video' as ContentType) ? 'video' : 'image');
      } catch {}
    }

    await this.prisma.reviews.delete({ where: { id } });
    return { message: 'Reseña eliminada correctamente' };
  }

  async createForbiddenWord(dto: CreateForbiddenWordDto) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    const created = await this.prisma.forbidden_Word.create({
      data: { idClub: dto.idClub, word: dto.word.toLowerCase().trim(), active: dto.active ?? true },
    });

    const matches = await this.prisma.reviews.findMany({
      where: { idClub: dto.idClub, isHidden: false },
    });
    const toHide = matches.filter((r) =>
      `${r.title ?? ''} ${r.comment ?? ''}`.toLowerCase().includes(created.word),
    );
    if (toHide.length > 0) {
      await this.prisma.reviews.updateMany({
        where: { id: { in: toHide.map((r) => r.id) } },
        data: { isHidden: true, hiddenReason: 'Contiene palabra filtrada automáticamente' },
      });
    }

    return created;
  }

  async findForbiddenWordsByClub(idClub: number) {
    return this.prisma.forbidden_Word.findMany({ where: { idClub }, orderBy: { createdAt: 'desc' } });
  }

  async removeForbiddenWord(id: number, user: RequestUser) {
    const word = await this.prisma.forbidden_Word.findUnique({ where: { id } });
    if (!word) throw new NotFoundException('Palabra no encontrada');
    await this.assertClubAccess(word.idClub, user);
    await this.prisma.forbidden_Word.delete({ where: { id } });
    return { message: 'Palabra eliminada correctamente' };
  }

  async toggleForbiddenWord(id: number, active: boolean, user: RequestUser) {
    const word = await this.prisma.forbidden_Word.findUnique({ where: { id } });
    if (!word) throw new NotFoundException('Palabra no encontrada');
    await this.assertClubAccess(word.idClub, user);
    return this.prisma.forbidden_Word.update({ where: { id }, data: { active } });
  }
}