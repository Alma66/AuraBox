import { RiderProfileService } from './rider-profile.service';
import { CreateRiderProfileDto } from './dto/create-rider-profile.dto';
import { UpdateRiderProfileDto } from './dto/update-rider-profile.dto';
export declare class RiderProfileController {
    private readonly svc;
    constructor(svc: RiderProfileService);
    create(dto: CreateRiderProfileDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findByClub(idClub: number, req: any): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
        vehicleType: import("@prisma/client").$Enums.VehicleType | null;
        licensePlate: string | null;
        availability: boolean;
        isActive: boolean;
        zonesCovered: string | null;
        costPerKm: string | null;
        totalDeliveries: number;
        currentAssignments: number;
    }[]>;
    findByEntrepreneur(idEntrepreneur: number, req: any): Promise<any>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdateRiderProfileDto, req: any): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
