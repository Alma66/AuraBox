import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateForbiddenWordDto } from './dto/create-forbidden-word.dto';

function sanitize(review: any) {
  if (!review) return review;
  if (review.reviewDate instanceof Date) review.reviewDate = review.reviewDate.toISOString();
  if (review.lastEditDate instanceof Date) review.lastEditDate = review.lastEditDate.toISOString();
  return review;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    const existing = await this.prisma.reviews.findFirst({
      where: { idUser: dto.idUser, idClub: dto.idClub },
    });
    if (existing) throw new BadRequestException('Ya has reseñado este club');

    const forbiddenMatch = await this.matchesForbiddenWord(dto.idClub, `${dto.title ?? ''} ${dto.comment ?? ''}`);

    const created = await this.prisma.reviews.create({
      data: {
        idUser: dto.idUser,
        idClub: dto.idClub,
        idSubscriptionTypes: dto.idSubscriptionTypes ?? null,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        reviewDate: dto.reviewDate ? new Date(dto.reviewDate) : new Date(),
        lastEditDate: dto.lastEditDate ? new Date(dto.lastEditDate) : undefined,
        active: dto.active ?? true,
        isHidden: forbiddenMatch,
        hiddenReason: forbiddenMatch ? 'Contiene palabra filtrada automáticamente' : null,
        mediaUrl: dto.mediaUrl ?? null,
        mediaType: dto.mediaType ?? null,
      },
    });
    return sanitize(created);
  }

  private async matchesForbiddenWord(idClub: number, text: string) {
    const words = await this.prisma.forbidden_Word.findMany({ where: { idClub, active: true } });
    const lower = text.toLowerCase();
    return words.some((w) => lower.includes(w.word.toLowerCase()));
  }

  async findAll() {
    const reviews = await this.prisma.reviews.findMany({ orderBy: { reviewDate: 'desc' } });
    return reviews.map(sanitize);
  }

  async findOne(id: number) {
    const review = await this.prisma.reviews.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Reseña no encontrada');
    return sanitize(review);
  }

  async findByUser(idUser: number) {
    const reviews = await this.prisma.reviews.findMany({ where: { idUser }, orderBy: { reviewDate: 'desc' } });
    return reviews.map(sanitize);
  }

  async findByClub(idClub: number, includeHidden = false) {
    const reviews = await this.prisma.reviews.findMany({
      where: { idClub, ...(includeHidden ? {} : { isHidden: false }) },
      orderBy: { reviewDate: 'desc' },
    });
    return reviews.map(sanitize);
  }

  async findHiddenByClub(idClub: number) {
    const reviews = await this.prisma.reviews.findMany({
      where: { idClub, isHidden: true },
      orderBy: { reviewDate: 'desc' },
    });
    return reviews.map(sanitize);
  }

  async update(id: number, dto: UpdateReviewDto) {
    const review = await this.prisma.reviews.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Reseña no encontrada');

    const updated = await this.prisma.reviews.update({
      where: { id },
      data: {
        ...dto,
        lastEditDate: new Date(),
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const review = await this.prisma.reviews.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Reseña no encontrada');
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

  async removeForbiddenWord(id: number) {
    const word = await this.prisma.forbidden_Word.findUnique({ where: { id } });
    if (!word) throw new NotFoundException('Palabra no encontrada');
    await this.prisma.forbidden_Word.delete({ where: { id } });
    return { message: 'Palabra eliminada correctamente' };
  }

  async toggleForbiddenWord(id: number, active: boolean) {
    const word = await this.prisma.forbidden_Word.findUnique({ where: { id } });
    if (!word) throw new NotFoundException('Palabra no encontrada');
    return this.prisma.forbidden_Word.update({ where: { id }, data: { active } });
  }
}