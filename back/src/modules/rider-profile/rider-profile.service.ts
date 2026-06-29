import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRiderProfileDto } from './dto/create-rider-profile.dto';
import { UpdateRiderProfileDto } from './dto/update-rider-profile.dto';

function sanitize(profile: any) {
  if (!profile) return profile;
  if (profile.createdAt instanceof Date) profile.createdAt = profile.createdAt.toISOString();
  if (profile.costPerKm !== undefined && profile.costPerKm !== null) {
    try {
      profile.costPerKm = profile.costPerKm.toString();
    } catch {}
  }
  return profile;
}

@Injectable()
export class RiderProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRiderProfileDto) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: dto.idEntrepreneur } });
    if (!entrepreneur) throw new NotFoundException('Emprendedor no encontrado');

    const exists = await this.prisma.rider_Profile.findUnique({ where: { idEntrepreneur: dto.idEntrepreneur } });
    if (exists) throw new ConflictException('Este emprendedor ya tiene un perfil de rider');

    const created = await this.prisma.rider_Profile.create({
      data: {
        idEntrepreneur: dto.idEntrepreneur,
        vehicleType: dto.vehicleType,
        licensePlate: dto.licensePlate,
        availability: dto.availability ?? true,
        zonesCovered: dto.zonesCovered,
        isActive: dto.isActive ?? true,
        costPerKm: dto.costPerKm ?? null,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const profiles = await this.prisma.rider_Profile.findMany({ orderBy: { createdAt: 'desc' } });
    return profiles.map(sanitize);
  }

  async findOne(id: number) {
    const profile = await this.prisma.rider_Profile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Perfil de rider no encontrado');
    return sanitize(profile);
  }

  async findByEntrepreneur(idEntrepreneur: number) {
    const profile = await this.prisma.rider_Profile.findUnique({ where: { idEntrepreneur } });
    return profile ? sanitize(profile) : null;
  }

  async findByClub(idClub: number) {
    const role = await this.prisma.role.findUnique({ where: { code: 'DELIVERY_RIDER' } });
    if (!role) return [];

    const associations = await this.prisma.entrepreneur_Club.findMany({ where: { idClub } });
    const entrepreneurIds = associations.map((a) => a.idEntrepreneurs);
    if (entrepreneurIds.length === 0) return [];

    const roleAssignments = await this.prisma.adminOrEntrepreneurRole.findMany({
      where: { idRole: role.id, assignedToType: 'Entrepreneur', assignedTo: { in: entrepreneurIds } },
    });
    const riderIds = Array.from(new Set(roleAssignments.map((r) => r.assignedTo)));
    if (riderIds.length === 0) return [];

    const entrepreneurs = await this.prisma.entrepreneurs.findMany({
      where: { id: { in: riderIds } },
      select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true },
    });

    const profiles = await this.prisma.rider_Profile.findMany({ where: { idEntrepreneur: { in: riderIds } } });
    const profilesById = new Map(profiles.map((p) => [p.idEntrepreneur, p]));

    const shipments = await this.prisma.shipments.findMany({
      where: { idClub, idAssignedRider: { in: riderIds } },
      select: { idAssignedRider: true, shipmentStatus: true },
    });

    return entrepreneurs.map((e) => {
      const profile = profilesById.get(e.id);
      const riderShipments = shipments.filter((s) => s.idAssignedRider === e.id);
      const totalDeliveries = riderShipments.filter((s) => s.shipmentStatus === 'Entregado').length;
      const currentAssignments = riderShipments.filter((s) => s.shipmentStatus === 'Asignado' || s.shipmentStatus === 'En_Camino').length;
      return {
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        phoneNumber: e.phoneNumber,
        vehicleType: profile?.vehicleType ?? null,
        licensePlate: profile?.licensePlate ?? null,
        availability: profile?.availability ?? false,
        isActive: profile?.isActive ?? false,
        zonesCovered: profile?.zonesCovered ?? null,
        costPerKm: profile?.costPerKm ? profile.costPerKm.toString() : null,
        totalDeliveries,
        currentAssignments,
      };
    });
  }

  async update(id: number, dto: UpdateRiderProfileDto) {
    const profile = await this.prisma.rider_Profile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Perfil de rider no encontrado');

    const updated = await this.prisma.rider_Profile.update({
      where: { id },
      data: { ...dto },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const profile = await this.prisma.rider_Profile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Perfil de rider no encontrado');
    await this.prisma.rider_Profile.delete({ where: { id } });
    return { message: 'Perfil de rider eliminado correctamente' };
  }
}