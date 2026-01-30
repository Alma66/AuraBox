import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';

function sanitize(shipment: any) {
  if (!shipment) return shipment;
  if (shipment.shippingCost !== undefined && shipment.shippingCost !== null) {
    try {
      shipment.shippingCost = (shipment.shippingCost as any).toString();
    } catch {}
  }
  ['estimatedDeliveryStartDate', 'estimatedDeliveryEndDate', 'actualDeliveryDate'].forEach((k) => {
    if (shipment[k] instanceof Date) shipment[k] = shipment[k].toISOString();
  });
  return shipment;
}

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateShipmentDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: dto.idUserSubscriptions } });
    if (!sub) throw new NotFoundException('Suscripción no encontrada');

    if (dto.idClub) {
      const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
      if (!club) throw new NotFoundException('Club no encontrado');
    }

    const created = await this.prisma.shipments.create({
      data: {
        idUser: dto.idUser,
        idUserSubscriptions: dto.idUserSubscriptions,
        idClub: dto.idClub,
        boxMonthYear: dto.boxMonthYear,
        estimatedDeliveryStartDate: dto.estimatedDeliveryStartDate ? new Date(dto.estimatedDeliveryStartDate) : undefined,
        estimatedDeliveryEndDate: dto.estimatedDeliveryEndDate ? new Date(dto.estimatedDeliveryEndDate) : undefined,
        actualDeliveryDate: dto.actualDeliveryDate ? new Date(dto.actualDeliveryDate) : undefined,
        shipmentStatus: dto.shipmentStatus,
        trackingNumber: dto.trackingNumber,
        logisticsCompany: dto.logisticsCompany,
        shippingCost: dto.shippingCost,
        shippingNotes: dto.shippingNotes,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const shipments = await this.prisma.shipments.findMany({
      orderBy: { estimatedDeliveryStartDate: 'desc' },
    });
    return shipments.map(sanitize);
  }

  async findOne(id: number) {
    const shipment = await this.prisma.shipments.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('Envío no encontrado');
    return sanitize(shipment);
  }

  async findByUser(idUser: number) {
    const shipments = await this.prisma.shipments.findMany({
      where: { idUser },
      orderBy: { estimatedDeliveryStartDate: 'desc' },
    });
    return shipments.map(sanitize);
  }

  async findByClub(idClub: number) {
    const shipments = await this.prisma.shipments.findMany({
      where: { idClub },
      orderBy: { estimatedDeliveryStartDate: 'desc' },
    });
    return shipments.map(sanitize);
  }

  async update(id: number, dto: UpdateShipmentDto) {
    const shipment = await this.prisma.shipments.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('Envío no encontrado');

    const updated = await this.prisma.shipments.update({
      where: { id },
      data: {
        ...dto,
        estimatedDeliveryStartDate: dto.estimatedDeliveryStartDate ? new Date(dto.estimatedDeliveryStartDate) : shipment.estimatedDeliveryStartDate,
        estimatedDeliveryEndDate: dto.estimatedDeliveryEndDate ? new Date(dto.estimatedDeliveryEndDate) : shipment.estimatedDeliveryEndDate,
        actualDeliveryDate: dto.actualDeliveryDate ? new Date(dto.actualDeliveryDate) : shipment.actualDeliveryDate,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const shipment = await this.prisma.shipments.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('Envío no encontrado');
    await this.prisma.shipments.delete({ where: { id } });
    return { message: 'Envío eliminado correctamente' };
  }
}