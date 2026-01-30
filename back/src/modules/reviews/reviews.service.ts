import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

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

    const created = await this.prisma.reviews.create({
      data: {
        idUser: dto.idUser,
        idClub: dto.idClub,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        reviewDate: dto.reviewDate ? new Date(dto.reviewDate) : new Date(),
        lastEditDate: dto.lastEditDate ? new Date(dto.lastEditDate) : undefined,
        active: dto.active ?? true,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const reviews = await this.prisma.reviews.findMany({
      orderBy: { reviewDate: 'desc' },
    });
    return reviews.map(sanitize);
  }

  async findOne(id: number) {
    const review = await this.prisma.reviews.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Reseña no encontrada');
    return sanitize(review);
  }

  async findByUser(idUser: number) {
    const reviews = await this.prisma.reviews.findMany({
      where: { idUser },
      orderBy: { reviewDate: 'desc' },
    });
    return reviews.map(sanitize);
  }

  async findByClub(idClub: number) {
    const reviews = await this.prisma.reviews.findMany({
      where: { idClub },
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
        lastEditDate: dto.lastEditDate ? new Date(dto.lastEditDate) : new Date(),
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
}