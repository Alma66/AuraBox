import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({
      where: { id: ownerId },
    });
    if (!entrepreneur) throw new ForbiddenException('Solo entrepreneurs pueden crear clubs');

    let logoUrl = dto.logoUrl ?? '';
    if (logoFile) {
      logoUrl = await this.cloudinary.uploadImage(logoFile, 'aurabox/clubs');
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
      data: {
        idEntrepreneurs: ownerId,
        idClub: club.id,
      },
    });

    return sanitizeClub(club);
  }

  async findAll() {
    const clubs = await this.prisma.club.findMany({
      orderBy: { creationDate: 'desc' },
    });
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

  async findOne(id: number) {
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Club no encontrado');
    const reviews = await this.prisma.reviews.findMany({
      where: { idClub: id, active: true },
      select: { id: true, rating: true, title: true, comment: true },
    });
    const { averageRating, totalReviews } = computeRating(reviews);
    return sanitizeClub({ ...club, averageRating, totalReviews, reviews });
  }

  async findFeatured() {
    const clubs = await this.prisma.club.findMany({
      where: { clubStatus: 'APROBADO' },
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
    if (userRole === 'OWNER') {
      const association = await this.prisma.entrepreneur_Club.findFirst({
        where: { idEntrepreneurs: userId, idClub: id },
      });
      if (!association) throw new ForbiddenException('No eres el owner de este club');
    } else if (userRole !== 'ADMIN') {
      throw new ForbiddenException('No autorizado para editar clubes');
    }
    const updated = await this.prisma.club.update({
      where: { id },
      data: dto,
    });
    return sanitizeClub(updated);
  }

  async remove(id: number, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden eliminar clubes');
    }
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Club no encontrado');
    await this.prisma.club.delete({ where: { id } });
    return { message: 'Club eliminado correctamente' };
  }
}