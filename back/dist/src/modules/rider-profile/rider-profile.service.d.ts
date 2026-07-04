import { PrismaService } from '../../prisma/prisma.service';
import { CreateRiderProfileDto } from './dto/create-rider-profile.dto';
import { UpdateRiderProfileDto } from './dto/update-rider-profile.dto';
export declare class RiderProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateRiderProfileDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByEntrepreneur(idEntrepreneur: number): Promise<any>;
    findByClub(idClub: number): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: number | null;
        vehicleType: import("@prisma/client").$Enums.VehicleType | null;
        licensePlate: string | null;
        availability: boolean;
        isActive: boolean;
        zonesCovered: string | null;
        costPerKm: string | null;
        totalDeliveries: number;
        currentAssignments: number;
    }[]>;
    update(id: number, dto: UpdateRiderProfileDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
