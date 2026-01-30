import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubSocialNetworkDto } from './dto/create-club-social-network.dto';
import { UpdateClubSocialNetworkDto } from './dto/update-club-social-network.dto';

@Injectable()
export class ClubSocialNetworksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClubSocialNetworkDto) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

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

  async update(id: number, dto: UpdateClubSocialNetworkDto) {
    const existing = await this.prisma.club_Social_Networks.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Red social no encontrada');

    if (dto.profileUrl && dto.profileUrl !== existing.profileUrl) {
      const dup = await this.prisma.club_Social_Networks.findUnique({ where: { profileUrl: dto.profileUrl } });
      if (dup) throw new ConflictException('Ya existe otra red social con esa URL de perfil');
    }

    if ((dto as any).idClub) {
      const c = await this.prisma.club.findUnique({ where: { id: (dto as any).idClub } });
      if (!c) throw new NotFoundException('Club (nuevo) no encontrado');
    }

    return this.prisma.club_Social_Networks.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.club_Social_Networks.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Red social no encontrada');
    await this.prisma.club_Social_Networks.delete({ where: { id } });
    return { message: 'Red social eliminada correctamente' };
  }
}