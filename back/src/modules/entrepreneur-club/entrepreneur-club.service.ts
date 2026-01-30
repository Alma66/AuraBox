import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntrepreneurClubDto } from './dto/create-entrepreneur-club.dto';
import { UpdateEntrepreneurClubDto } from './dto/update-entrepreneur-club.dto';

function sanitize(association: any) {
  if (!association) return association;
  if (association.associationDate instanceof Date) association.associationDate = association.associationDate.toISOString();
  return association;
}

@Injectable()
export class EntrepreneurClubService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEntrepreneurClubDto) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({
      where: { id: dto.idEntrepreneurs },
    });
    if (!entrepreneur) throw new NotFoundException('Emprendedor no encontrado');

    const club = await this.prisma.club.findUnique({
      where: { id: dto.idClub },
    });
    if (!club) throw new NotFoundException('Club no encontrado');

    const exists = await this.prisma.entrepreneur_Club.findFirst({
      where: {
        idEntrepreneurs: dto.idEntrepreneurs,
        idClub: dto.idClub,
      },
    });
    if (exists) throw new ConflictException('La asociación ya existe');

    const created = await this.prisma.entrepreneur_Club.create({
      data: {
        idEntrepreneurs: dto.idEntrepreneurs,
        idClub: dto.idClub,
        associationDate: dto.associationDate ? new Date(dto.associationDate) : new Date(),
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const associations = await this.prisma.entrepreneur_Club.findMany({
      orderBy: { id: 'asc' },
    });
    return associations.map(sanitize);
  }

  async findByClub(idClub: number) {
    const associations = await this.prisma.entrepreneur_Club.findMany({
      where: { idClub },
      orderBy: { associationDate: 'desc' },
    });
    return associations.map(sanitize);
  }

  async findByEntrepreneur(idEntrepreneur: number) {
    const associations = await this.prisma.entrepreneur_Club.findMany({
      where: { idEntrepreneurs: idEntrepreneur },
      orderBy: { associationDate: 'desc' },
    });
    return associations.map(sanitize);
  }

  async findOne(id: number) {
    const item = await this.prisma.entrepreneur_Club.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Asociación no encontrada');
    return sanitize(item);
  }

  async update(id: number, dto: UpdateEntrepreneurClubDto) {
    const existing = await this.prisma.entrepreneur_Club.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asociación no encontrada');

    if ((dto as any).idEntrepreneurs) {
      const e = await this.prisma.entrepreneurs.findUnique({ where: { id: (dto as any).idEntrepreneurs } });
      if (!e) throw new NotFoundException('Emprendedor (nuevo) no encontrado');
    }
    if ((dto as any).idClub) {
      const c = await this.prisma.club.findUnique({ where: { id: (dto as any).idClub } });
      if (!c) throw new NotFoundException('Club (nuevo) no encontrado');
    }

    const updated = await this.prisma.entrepreneur_Club.update({
      where: { id },
      data: {
        idEntrepreneurs: (dto as any).idEntrepreneurs ?? existing.idEntrepreneurs,
        idClub: (dto as any).idClub ?? existing.idClub,
        associationDate: (dto as any).associationDate ? new Date((dto as any).associationDate) : existing.associationDate,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const existing = await this.prisma.entrepreneur_Club.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asociación no encontrada');
    await this.prisma.entrepreneur_Club.delete({ where: { id } });
    return { message: 'Asociación eliminada correctamente' };
  }
}