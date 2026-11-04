import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBoxContentHistoryDto } from './dto/create-box-content-history.dto';
import { UpdateBoxContentHistoryDto } from './dto/update-box-content-history.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

type RequestUser = { id: number; role: string };

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
    if (requesterRole === 'admin') return subType;
    if (requesterRole !== 'entrepreneur' || !requesterId) {
      throw new ForbiddenException('No tenés acceso a esta suscripción');
    }
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idEntrepreneurs: requesterId, idClub: subType.idClub },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a esta suscripción');
    return subType;
  }

  private async assertCustomerAccess(idSubscriptionTypes: number, idUser: number) {
    const sub = await this.prisma.user_Subscriptions.findFirst({
      where: {
        idUser,
        idSubscriptionTypes,
        subscriptionStatus: { not: 'Pendiente_Pago' as any },
      },
    });
    if (!sub) throw new ForbiddenException('Solo podés ver el contenido de las cajas a las que estás suscripto');
  }

  private async assertReadAccess(idSubscriptionTypes: number, user: RequestUser) {
    if (user.role === 'customer') {
      const subType = await this.prisma.subscription_Types.findUnique({ where: { id: idSubscriptionTypes } });
      if (!subType) throw new NotFoundException('Tipo de suscripción no encontrado');
      await this.assertCustomerAccess(idSubscriptionTypes, user.id);
      return { onlyPublished: true };
    }
    await this.assertOwnership(idSubscriptionTypes, user.id, user.role);
    return { onlyPublished: false };
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
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePerPage = Number.isFinite(perPage) && perPage > 0 ? Math.min(perPage, 100) : 50;
    const histories = await this.prisma.boxContentHistory.findMany({
      skip: (safePage - 1) * safePerPage,
      take: safePerPage,
      orderBy: { publicationDate: 'desc' },
    });
    return histories.map(sanitize);
  }

  async findBySubscriptionType(idSubscriptionTypes: number, user: RequestUser) {
    const { onlyPublished } = await this.assertReadAccess(idSubscriptionTypes, user);
    const histories = await this.prisma.boxContentHistory.findMany({
      where: {
        idSubscriptionTypes,
        ...(onlyPublished ? { publicationDate: { lte: new Date() } } : {}),
      },
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

  async findOne(id: number, user: RequestUser) {
    const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Historial de caja no encontrado');

    const { onlyPublished } = await this.assertReadAccess(item.idSubscriptionTypes, user);
    if (onlyPublished && item.publicationDate > new Date()) {
      throw new NotFoundException('Historial de caja no encontrado');
    }
    return sanitize(item);
  }

  async update(id: number, dto: UpdateBoxContentHistoryDto, requesterId?: number, requesterRole?: string) {
    const item = await this.prisma.boxContentHistory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Historial de caja no encontrado');
    await this.assertOwnership(item.idSubscriptionTypes, requesterId, requesterRole);

    const { idSubscriptionTypes: _ignored, ...safeDto } = dto as any;

    const updated = await this.prisma.boxContentHistory.update({
      where: { id },
      data: {
        ...safeDto,
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