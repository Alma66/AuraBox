import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const MAX_ROWS = 500;

@Injectable()
export class ClubStatusHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.club_Status_History.findMany({ orderBy: { id: 'desc' }, take: MAX_ROWS });
  }

  async findByClub(idClub: number) {
    return this.prisma.club_Status_History.findMany({
      where: { idClub },
      orderBy: { id: 'desc' },
      take: MAX_ROWS,
    });
  }

  async findByAdmin(idAdmins: number) {
    return this.prisma.club_Status_History.findMany({
      where: { idAdmins },
      orderBy: { id: 'desc' },
      take: MAX_ROWS,
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.club_Status_History.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Registro de estado no encontrado');
    return item;
  }
}