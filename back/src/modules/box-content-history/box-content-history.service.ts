import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBoxContentHistoryDto } from './dto/create-box-content-history.dto';
import { UpdateBoxContentHistoryDto } from './dto/update-box-content-history.dto';

function sanitize(history: any) {
  if (!history) return history;
  if (history.productExpirationDate instanceof Date) history.productExpirationDate = history.productExpirationDate.toISOString();
  if (history.publicationDate instanceof Date) history.publicationDate = history.publicationDate.toISOString();
  return history;
}

@Injectable()
export class BoxContentHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBoxContentHistoryDto) {
    const subType = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
    if (!subType) throw new NotFoundException('Tipo de suscripción no encontrado');

    const created = await this.prisma.boxContentHistory.create({
      data: {
        idSubscriptionTypes: dto.idSubscriptionTypes,
        deliveryMonthYear: dto.deliveryMonthYear,
        productName: dto.productName,
        productDescription: dto.productDescription,
        usageInstructions: dto.usageInstructions ?? null,
        productExpirationDate: dto.productExpirationDate ? new Date(dto.productExpirationDate) : null,
        productImageUrl: dto.productImageUrl ?? null,
        productVideoUrl: dto.productVideoUrl ?? null,
        additionalNotes: dto.additionalNotes ?? null,
        publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : null,
      },
    });
    return sanitize(created);
  }

  async findAll(page = 1, perPage = 50) {
    const skip = (page - 1) * perPage;
    const histories = await this.prisma.boxContentHistory.findMany({
      skip,
      take: perPage,
      orderBy: { publicationDate: 'desc' },
    });
    return histories.map(sanitize);
  }

  async findBySubscriptionType(idSubscriptionTypes: number) {
    const histories = await this.prisma.boxContentHistory.findMany({
      where: { idSubscriptionTypes },
      orderBy: { publicationDate: 'desc' },
    });
    return histories.map(sanitize);
  }

  async findByDeliveryMonth(deliveryMonthYear: string) {
    const histories = await this.prisma.boxContentHistory.findMany({
      where: { deliveryMonthYear },
      orderBy: { publicationDate: 'desc' },
    });
    return histories.map(sanitize);
  }

  async findOne(id: number) {
    const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Historial de caja no encontrado');
    return sanitize(item);
  }

  async update(id: number, dto: UpdateBoxContentHistoryDto) {
    const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Historial de caja no encontrado');

    const updated = await this.prisma.boxContentHistory.update({
      where: { id },
      data: {
        ...dto,
        productExpirationDate: dto.productExpirationDate ? new Date(dto.productExpirationDate) : item.productExpirationDate,
        publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : item.publicationDate,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Historial de caja no encontrado');
    await this.prisma.boxContentHistory.delete({ where: { id } });
    return { message: 'Registro de BoxContentHistory eliminado correctamente' };
  }
}