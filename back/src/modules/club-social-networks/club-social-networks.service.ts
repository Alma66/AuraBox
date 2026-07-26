import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubSocialNetworkDto } from './dto/create-club-social-network.dto';
import { UpdateClubSocialNetworkDto } from './dto/update-club-social-network.dto';

type RequestUser = { id: number; role: string };

@Injectable()
export class ClubSocialNetworksService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertClubAccess(idClub: number, user: RequestUser) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  async create(dto: CreateClubSocialNetworkDto, user: RequestUser) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    await this.assertClubAccess(dto.idClub, user);

    const exists = await this.prisma.club_Social_Networks.findUnique({ where: { profileUrl: dto.profileUrl } });
    if (exists) throw new ConflictException('Ya existe una red social con esa URL de perfil');

    return this.prisma.club_Social_Networks.create({
      data: {
        idClub: dto.idClub,
        networkType: dto.networkType,
        profileUrl: dto.profileUrl,
      },
    });
  }

  async findAll() {
    return this.prisma.club_Social_Networks.findMany({ orderBy: { id: 'desc' } });
  }

  async findByClub(idClub: number) {
    return this.prisma.club_Social_Networks.findMany({
      where: { idClub },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.club_Social_Networks.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Red social no encontrada');
    return item;
  }

  async update(id: number, dto: UpdateClubSocialNetworkDto, user: RequestUser) {
    const existing = await this.prisma.club_Social_Networks.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Red social no encontrada');
    await this.assertClubAccess(existing.idClub, user);

    if (dto.profileUrl && dto.profileUrl !== existing.profileUrl) {
      const dup = await this.prisma.club_Social_Networks.findUnique({ where: { profileUrl: dto.profileUrl } });
      if (dup) throw new ConflictException('Ya existe otra red social con esa URL de perfil');
    }

    if (user.role === 'admin' && dto.idClub && dto.idClub !== existing.idClub) {
      const c = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
      if (!c) throw new NotFoundException('Club (nuevo) no encontrado');
    }
    const targetIdClub = user.role === 'admin' && dto.idClub ? dto.idClub : existing.idClub;

    return this.prisma.club_Social_Networks.update({
      where: { id },
      data: {
        idClub: targetIdClub,
        networkType: dto.networkType ?? existing.networkType,
        profileUrl: dto.profileUrl ?? existing.profileUrl,
      },
    });
  }

  async remove(id: number, user: RequestUser) {
    const existing = await this.prisma.club_Social_Networks.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Red social no encontrada');
    await this.assertClubAccess(existing.idClub, user);
    await this.prisma.club_Social_Networks.delete({ where: { id } });
    return { message: 'Red social eliminada correctamente' };
  }
}