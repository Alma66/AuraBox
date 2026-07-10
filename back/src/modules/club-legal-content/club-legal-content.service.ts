import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubLegalContentDto } from './dto/create-club-legal-content.dto';
import { UpdateClubLegalContentDto } from './dto/update-club-legal-content.dto';

@Injectable()
export class ClubLegalContentService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwnership(idClub: number, entrepreneurId: number) {
    const association = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: entrepreneurId },
    });
    if (!association) throw new ForbiddenException('No tenés acceso a este club');
  }

  async findByClub(idClub: number) {
    const content = await this.prisma.club_Legal_Content.findUnique({ where: { idClub } });
    if (!content) {
      return { idClub, termsAndConditions: [], privacyAndSecurityPolicy: [] };
    }
    return content;
  }

  async upsert(idClub: number, dto: CreateClubLegalContentDto | UpdateClubLegalContentDto, entrepreneurId: number) {
    await this.assertOwnership(idClub, entrepreneurId);
    const club = await this.prisma.club.findUnique({ where: { id: idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    return this.prisma.club_Legal_Content.upsert({
      where: { idClub },
      create: {
        idClub,
        termsAndConditions: dto.termsAndConditions ?? [],
        privacyAndSecurityPolicy: dto.privacyAndSecurityPolicy ?? [],
      },
      update: {
        ...(dto.termsAndConditions !== undefined ? { termsAndConditions: dto.termsAndConditions } : {}),
        ...(dto.privacyAndSecurityPolicy !== undefined ? { privacyAndSecurityPolicy: dto.privacyAndSecurityPolicy } : {}),
      },
    });
  }
}