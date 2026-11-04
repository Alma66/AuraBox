import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getAcceptedCodes, saveAcceptedCodes } from '../../common/utils/payment-methods';
import { UpdateClubBillingDto } from './dto/update-club-billing.dto';

type RequestUser = { id: number; role: string };

@Injectable()
export class ClubBillingService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertAccess(clubId: number, user: RequestUser) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club no encontrado');
    if (user.role === 'admin') return club;
    const link = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub: clubId, idEntrepreneurs: user.id },
    });
    if (!link) throw new ForbiddenException('No tenés acceso a este club');
    return club;
  }

  async get(clubId: number, user: RequestUser) {
    const club = await this.assertAccess(clubId, user);
    const methods = await getAcceptedCodes(this.prisma, clubId);
    return {
      bankHolder: club.bankHolder,
      bankCbu: club.bankCbu,
      bankAlias: club.bankAlias,
      methods,
    };
  }

  async update(clubId: number, dto: UpdateClubBillingDto, user: RequestUser) {
    await this.assertAccess(clubId, user);
    const methods = Array.from(new Set(dto.methods));

    if (methods.includes('transferencia') && (!dto.bankHolder || (!dto.bankCbu && !dto.bankAlias))) {
      throw new BadRequestException('Para aceptar transferencias cargá el titular y el CBU o el alias');
    }

    await this.prisma.club.update({
      where: { id: clubId },
      data: {
        bankHolder: dto.bankHolder ?? null,
        bankCbu: dto.bankCbu ?? null,
        bankAlias: dto.bankAlias ?? null,
      },
    });
    await saveAcceptedCodes(this.prisma, clubId, methods);
    return this.get(clubId, user);
  }
}