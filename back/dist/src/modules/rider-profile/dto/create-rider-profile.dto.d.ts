import { VehicleType } from '@prisma/client';
export declare class CreateRiderProfileDto {
    idEntrepreneur: number;
    vehicleType: VehicleType;
    licensePlate?: string;
    availability?: boolean;
    zonesCovered?: string;
    isActive?: boolean;
    costPerKm?: number;
}
