import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { Prisma } from '@prisma/client';

function sanitizeClub(club: any) {
  if (!club) return club;
  if (club.creationDate instanceof Date) {
    club.creationDate = club.creationDate.toISOString();
  }
  return club;
}

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: number, dto: CreateClubDto) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({
      where: { id: ownerId },
    });
    if (!entrepreneur) throw new ForbiddenException('Solo entrepreneurs pueden crear clubs');

    const club = await this.prisma.club.create({
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
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
    return clubs.map(sanitizeClub);
  }

  async findOne(id: number) {
    const club = await this.prisma.club.findUnique({ where: { id } });
    if (!club) throw new NotFoundException('Club no encontrado');
    return sanitizeClub(club);
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