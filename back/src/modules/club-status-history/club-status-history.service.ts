import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubStatusHistoryDto } from './dto/create-club-status-history.dto';
import { UpdateClubStatusHistoryDto } from './dto/update-club-status-history.dto';

@Injectable()
export class ClubStatusHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClubStatusHistoryDto) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    const admin = await this.prisma.admins.findUnique({ where: { id: dto.idAdmins } });
    if (!admin) throw new NotFoundException('Admin no encontrado');

    return this.prisma.club_Status_History.create({
      data: {
        idClub: dto.idClub,
        idAdmins: dto.idAdmins,
        previousStatus: dto.previousStatus,
        newStatus: dto.newStatus,
        changeDate: dto.changeDate ? new Date(dto.changeDate) : new Date(),
        changeReason: dto.changeReason ?? null,
      },
    });
  }

  async findAll() {
    return this.prisma.club_Status_History.findMany({ orderBy: { id: 'desc' } });
  }

  async findByClub(idClub: number) {
    return this.prisma.club_Status_History.findMany({
      where: { idClub },
      orderBy: { id: 'desc' },
    });
  }

  async findByAdmin(idAdmins: number) {
    return this.prisma.club_Status_History.findMany({
      where: { idAdmins },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.club_Status_History.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Registro de estado no encontrado');
    return item;
  }

  async update(id: number, dto: UpdateClubStatusHistoryDto) {
    const item = await this.prisma.club_Status_History.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Registro de estado no encontrado');

    if ((dto as any).idClub) {
      const c = await this.prisma.club.findUnique({ where: { id: (dto as any).idClub } });
      if (!c) throw new NotFoundException('Club (nuevo) no encontrado');
    }
    if ((dto as any).idAdmins) {
      const a = await this.prisma.admins.findUnique({ where: { id: (dto as any).idAdmins } });
      if (!a) throw new NotFoundException('Admin (nuevo) no encontrado');
    }

    return this.prisma.club_Status_History.update({
      where: { id },
      data: {
        ...dto,
        changeDate: dto.changeDate ? new Date(dto.changeDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    const item = await this.prisma.club_Status_History.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Registro de estado no encontrado');
    await this.prisma.club_Status_History.delete({ where: { id } });
    return { message: 'Registro de estado eliminado correctamente' };
  }
}