import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { AssignDeliveryDto } from './dto/assign-delivery.dto';

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
        idAssignedRider: dto.idAssignedRider,
        boxMonthYear: dto.boxMonthYear,
        estimatedDeliveryStartDate: dto.estimatedDeliveryStartDate ? new Date(dto.estimatedDeliveryStartDate) : undefined,
        estimatedDeliveryEndDate: dto.estimatedDeliveryEndDate ? new Date(dto.estimatedDeliveryEndDate) : undefined,
        actualDeliveryDate: dto.actualDeliveryDate ? new Date(dto.actualDeliveryDate) : undefined,
        shipmentStatus: dto.shipmentStatus,
        trackingNumber: dto.trackingNumber,
        logisticsCompany: dto.logisticsCompany,
        shippingCost: dto.shippingCost,
        shippingNotes: dto.shippingNotes,
        street: dto.street,
        addressNumber: dto.addressNumber,
        locality: dto.locality,
        city: dto.city,
        postalCode: dto.postalCode,
        province: dto.province,
        instructions: dto.instructions,
        boxContent: dto.boxContent,
        deliveryWindowFrom: dto.deliveryWindowFrom,
        deliveryWindowTo: dto.deliveryWindowTo,
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

    const userIds = Array.from(new Set(shipments.map((s) => s.idUser)));
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, firstName: true, lastName: true, email: true },
        })
      : [];
    const usersById = new Map(users.map((u) => [u.id, u]));

    return shipments.map((s) => ({
      ...sanitize(s),
      user: usersById.get(s.idUser) ?? null,
    }));
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

  async assignRiderForClub(id: number, idClub: number, dto: AssignDeliveryDto) {
    const shipment = await this.prisma.shipments.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('Envío no encontrado');
    if (shipment.idClub !== idClub) throw new BadRequestException('El envío no pertenece a este club');

    if (dto.idAssignedRider) {
      const role = await this.prisma.role.findUnique({ where: { code: 'DELIVERY_RIDER' } });
      if (!role) throw new BadRequestException('No existe el rol DELIVERY_RIDER configurado');

      const hasRole = await this.prisma.adminOrEntrepreneurRole.findFirst({
        where: { idRole: role.id, assignedToType: 'Entrepreneur', assignedTo: dto.idAssignedRider },
      });
      if (!hasRole) throw new BadRequestException('El emprendedor seleccionado no tiene el rol de rider');

      const belongsToClub = await this.prisma.entrepreneur_Club.findFirst({
        where: { idClub, idEntrepreneurs: dto.idAssignedRider },
      });
      if (!belongsToClub) throw new BadRequestException('El rider no pertenece a este club');
    }

    const updated = await this.prisma.shipments.update({
      where: { id },
      data: {
        idAssignedRider: dto.idAssignedRider === undefined ? shipment.idAssignedRider : dto.idAssignedRider,
        shipmentStatus: dto.shipmentStatus ?? shipment.shipmentStatus,
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