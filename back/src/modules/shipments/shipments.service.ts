import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { AssignDeliveryDto, AssignNewShipmentDto } from './dto/assign-delivery.dto';

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

function currentBoxMonthYear() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateCourierForClub(idClub: number, idCourier: number) {
    const clubCourier = await this.prisma.club_Courier.findFirst({
      where: { idClub, idCourier, active: true },
    });
    if (!clubCourier) throw new BadRequestException('El courier seleccionado no está habilitado para este club');
    const courier = await this.prisma.courier.findUnique({ where: { id: idCourier } });
    if (!courier || !courier.active) throw new BadRequestException('Courier inválido');
    return courier;
  }

  private async validateRiderForClub(idClub: number, idAssignedRider: number) {
    const role = await this.prisma.role.findUnique({ where: { code: 'DELIVERY_RIDER' } });
    if (!role) throw new BadRequestException('No existe el rol DELIVERY_RIDER configurado');

    const hasRole = await this.prisma.adminOrEntrepreneurRole.findFirst({
      where: { idRole: role.id, assignedToType: 'Entrepreneur', assignedTo: idAssignedRider },
    });
    if (!hasRole) throw new BadRequestException('El emprendedor seleccionado no tiene el rol de rider');

    const belongsToClub = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: idAssignedRider },
    });
    if (!belongsToClub) throw new BadRequestException('El rider no pertenece a este club');
  }

  async create(dto: CreateShipmentDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: dto.idUserSubscriptions } });
    if (!sub) throw new NotFoundException('Suscripción no encontrada');

    if (dto.idClub) {
      const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
      if (!club) throw new NotFoundException('Club no encontrado');
      if (dto.idCourier) await this.validateCourierForClub(dto.idClub, dto.idCourier);
    }

    const created = await this.prisma.shipments.create({
      data: {
        idUser: dto.idUser,
        idUserSubscriptions: dto.idUserSubscriptions,
        idClub: dto.idClub,
        idAssignedRider: dto.idAssignedRider,
        idCourier: dto.idCourier,
        boxMonthYear: dto.boxMonthYear,
        estimatedDeliveryStartDate: dto.estimatedDeliveryStartDate ? new Date(dto.estimatedDeliveryStartDate) : undefined,
        estimatedDeliveryEndDate: dto.estimatedDeliveryEndDate ? new Date(dto.estimatedDeliveryEndDate) : undefined,
        actualDeliveryDate: dto.actualDeliveryDate ? new Date(dto.actualDeliveryDate) : undefined,
        shipmentStatus: dto.shipmentStatus,
        trackingNumber: dto.trackingNumber,
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

  async assignNewShipment(dto: AssignNewShipmentDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.idUser } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const sub = await this.prisma.user_Subscriptions.findUnique({ where: { id: dto.idUserSubscriptions } });
    if (!sub) throw new NotFoundException('Suscripción no encontrada');

    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    const courier = await this.validateCourierForClub(dto.idClub, dto.idCourier);

    if (courier.isInternal) {
      if (!dto.idAssignedRider) throw new BadRequestException('Debe seleccionar un rider para este courier interno');
      await this.validateRiderForClub(dto.idClub, dto.idAssignedRider);
    }

    const boxMonthYear = dto.boxMonthYear ?? currentBoxMonthYear();

    const subType = await this.prisma.subscription_Types.findUnique({ where: { id: sub.idSubscriptionTypes } });
    const boxContentEntry = subType
      ? await this.prisma.box_Content_History.findFirst({
          where: { idSubscriptionTypes: subType.id, deliveryMonthYear: boxMonthYear },
        })
      : null;

    const created = await this.prisma.shipments.create({
      data: {
        idUser: dto.idUser,
        idUserSubscriptions: dto.idUserSubscriptions,
        idClub: dto.idClub,
        idAssignedRider: courier.isInternal ? dto.idAssignedRider : null,
        idCourier: dto.idCourier,
        boxMonthYear,
        shipmentStatus: 'Asignado',
        street: user.streetAddress,
        addressNumber: user.addressNumber ? String(user.addressNumber) : null,
        locality: user.addressDetails,
        city: user.city,
        postalCode: user.postalCode,
        province: user.province,
        boxContent: boxContentEntry?.productName ?? null,
      },
    });
    return sanitize(created);
  }

  async getPendingForClub(idClub: number) {
    const boxMonthYear = currentBoxMonthYear();

    const subscriptionTypes = await this.prisma.subscription_Types.findMany({
      where: { idClub, active: true },
    });
    const subscriptionTypeIds = subscriptionTypes.map((s) => s.id);
    if (subscriptionTypeIds.length === 0) return [];

    const activeSubscriptions = await this.prisma.user_Subscriptions.findMany({
      where: { idSubscriptionTypes: { in: subscriptionTypeIds }, subscriptionStatus: 'Activa' },
    });
    if (activeSubscriptions.length === 0) return [];

    const existingShipments = await this.prisma.shipments.findMany({
      where: {
        idClub,
        boxMonthYear,
        idUserSubscriptions: { in: activeSubscriptions.map((s) => s.id) },
      },
      select: { idUserSubscriptions: true },
    });
    const alreadyShipped = new Set(existingShipments.map((s) => s.idUserSubscriptions));

    const pendingSubscriptions = activeSubscriptions.filter((s) => !alreadyShipped.has(s.id));
    if (pendingSubscriptions.length === 0) return [];

    const userIds = Array.from(new Set(pendingSubscriptions.map((s) => s.idUser)));
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true, firstName: true, lastName: true, email: true, phoneNumber: true,
        streetAddress: true, addressNumber: true, floorNumber: true, addressDetails: true,
        city: true, postalCode: true, province: true,
      },
    });
    const usersById = new Map(users.map((u) => [u.id, u]));
    const subTypesById = new Map(subscriptionTypes.map((s) => [s.id, s]));

    const clubCouriers = await this.prisma.club_Courier.findMany({ where: { idClub, active: true } });
    const courierIds = clubCouriers.map((c) => c.idCourier);
    const couriers = courierIds.length
      ? await this.prisma.courier.findMany({ where: { id: { in: courierIds }, active: true } })
      : [];
    const couriersById = new Map(couriers.map((c) => [c.id, c]));

    const userPreferences = await this.prisma.user_Courier_Preference.findMany({
      where: { idClub, idUser: { in: userIds }, active: true },
    });
    const preferencesByUser = new Map<number, number[]>();
    userPreferences.forEach((p) => {
      const list = preferencesByUser.get(p.idUser) ?? [];
      list.push(p.idCourier);
      preferencesByUser.set(p.idUser, list);
    });

    return pendingSubscriptions.map((sub) => {
      const user = usersById.get(sub.idUser);
      const subType = subTypesById.get(sub.idSubscriptionTypes);
      const userPrefs = preferencesByUser.get(sub.idUser);
      const allowedCourierIds = userPrefs && userPrefs.length > 0
        ? courierIds.filter((id) => userPrefs.includes(id))
        : courierIds;
      const availableCouriers = allowedCourierIds.map((id) => couriersById.get(id)).filter(Boolean);

      return {
        idUserSubscriptions: sub.id,
        idUser: sub.idUser,
        idSubscriptionTypes: sub.idSubscriptionTypes,
        subscriptionName: subType?.name ?? null,
        boxMonthYear,
        user: user
          ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              address: {
                street: user.streetAddress,
                addressNumber: user.addressNumber,
                floorNumber: user.floorNumber,
                addressDetails: user.addressDetails,
                city: user.city,
                postalCode: user.postalCode,
                province: user.province,
              },
            }
          : null,
        availableCouriers: availableCouriers.map((c: any) => ({
          id: c.id, code: c.code, name: c.name, isInternal: c.isInternal,
        })),
      };
    });
  }

  async findAll() {
    const shipments = await this.prisma.shipments.findMany({ orderBy: { id: 'desc' } });
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
      orderBy: { id: 'desc' },
    });
    return shipments.map(sanitize);
  }

  async findByClub(idClub: number) {
    const shipments = await this.prisma.shipments.findMany({
      where: { idClub },
      orderBy: { id: 'desc' },
    });

    const userIds = Array.from(new Set(shipments.map((s) => s.idUser)));
    const riderIds = Array.from(new Set(shipments.map((s) => s.idAssignedRider).filter((id): id is number => !!id)));
    const courierIds = Array.from(new Set(shipments.map((s) => s.idCourier).filter((id): id is number => !!id)));

    const [users, riders, couriers] = await Promise.all([
      userIds.length
        ? this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true, email: true } })
        : [],
      riderIds.length
        ? this.prisma.entrepreneurs.findMany({ where: { id: { in: riderIds } }, select: { id: true, firstName: true, lastName: true, phoneNumber: true, email: true } })
        : [],
      courierIds.length
        ? this.prisma.courier.findMany({ where: { id: { in: courierIds } } })
        : [],
    ]);

    const usersById = new Map(users.map((u) => [u.id, u]));
    const ridersById = new Map(riders.map((r) => [r.id, r]));
    const couriersById = new Map(couriers.map((c) => [c.id, c]));

    return shipments.map((s) => ({
      ...sanitize(s),
      user: usersById.get(s.idUser) ?? null,
      rider: s.idAssignedRider ? ridersById.get(s.idAssignedRider) ?? null : null,
      courier: s.idCourier ? couriersById.get(s.idCourier) ?? null : null,
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

    let idCourier = shipment.idCourier;
    let idAssignedRider = shipment.idAssignedRider;

    if (dto.idCourier !== undefined) {
      const courier = await this.validateCourierForClub(idClub, dto.idCourier);
      idCourier = dto.idCourier;
      if (courier.isInternal) {
        if (dto.idAssignedRider) {
          await this.validateRiderForClub(idClub, dto.idAssignedRider);
          idAssignedRider = dto.idAssignedRider;
        }
      } else {
        idAssignedRider = null;
      }
    } else if (dto.idAssignedRider !== undefined) {
      if (dto.idAssignedRider) await this.validateRiderForClub(idClub, dto.idAssignedRider);
      idAssignedRider = dto.idAssignedRider;
    }

    const updated = await this.prisma.shipments.update({
      where: { id },
      data: {
        idCourier,
        idAssignedRider,
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