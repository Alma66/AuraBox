import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBoxContentHistoryDto } from './dto/create-box-content-history.dto';
import { UpdateBoxContentHistoryDto } from './dto/update-box-content-history.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

function sanitize(history: any) {
  if (!history) return history;
  if (history.productExpirationDate instanceof Date) history.productExpirationDate = history.productExpirationDate.toISOString();
  if (history.publicationDate instanceof Date) history.publicationDate = history.publicationDate.toISOString();
  if (history.updatedAt instanceof Date) history.updatedAt = history.updatedAt.toISOString();
  return history;
}

@Injectable()
export class BoxContentHistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private async assertOwnership(idSubscriptionTypes: number, requesterId?: number, requesterRole?: string) {
    const subType = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
    if (!subType) throw new NotFoundException('Tipo de suscripción no encontrado');
    if (requesterRole === 'entrepreneur' && requesterId) {
      const assoc = await this.prisma.entrepreneur_Club.findFirst({
        where: { idEntrepreneurs: requesterId, idClub: subType.idClub },
      });
      if (!assoc) throw new ForbiddenException('No tenés acceso a esta suscripción');
    }
    return subType;
  }

  async create(dto: CreateBoxContentHistoryDto, imageFile?: Express.Multer.File, requesterId?: number, requesterRole?: string) {
    await this.assertOwnership(dto.idSubscriptionTypes, requesterId, requesterRole);

    let productImageUrl = dto.productImageUrl ?? null;
    if (imageFile) {
      productImageUrl = await this.cloudinary.uploadImage(imageFile, 'aurabox/boxes');
    }

    const created = await this.prisma.boxContentHistory.create({
      data: {
        idSubscriptionTypes: dto.idSubscriptionTypes,
        deliveryMonthYear: dto.deliveryMonthYear,
        productName: dto.productName,
        productDescription: dto.productDescription,
        usageInstructions: dto.usageInstructions ?? null,
        productExpirationDate: dto.productExpirationDate ? new Date(dto.productExpirationDate) : null,
        productImageUrl,
        productVideoUrl: dto.productVideoUrl ?? null,
        additionalNotes: dto.additionalNotes ?? null,
        publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : new Date(),
        ageRestriction: dto.ageRestriction ?? false,
        originLocation: dto.originLocation ?? null,
        containsAllergens: dto.containsAllergens ?? false,
        allergensDetail: dto.allergensDetail ?? null,
        isDangerousItem: dto.isDangerousItem ?? false,
        dangerDetail: dto.dangerDetail ?? null,
        requiresCleaning: dto.requiresCleaning ?? false,
        cleaningInstructions: dto.cleaningInstructions ?? null,
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

  async update(id: number, dto: UpdateBoxContentHistoryDto, requesterId?: number, requesterRole?: string) {
    const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Historial de caja no encontrado');
    await this.assertOwnership(item.idSubscriptionTypes, requesterId, requesterRole);

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

  async remove(id: number, requesterId?: number, requesterRole?: string) {
    const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Historial de caja no encontrado');
    await this.assertOwnership(item.idSubscriptionTypes, requesterId, requesterRole);

    if (item.productImageUrl) {
      const publicId = this.cloudinary.extractPublicId(item.productImageUrl);
      await this.cloudinary.deleteImage(publicId);
    }

    await this.prisma.boxContentHistory.delete({ where: { id } });
    return { message: 'Registro de BoxContentHistory eliminado correctamente' };
  }
}