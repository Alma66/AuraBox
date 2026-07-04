import { ShipmentStatus } from '@prisma/client';
export declare class AssignDeliveryDto {
    idAssignedRider?: number | null;
    idCourier?: number;
    shipmentStatus?: ShipmentStatus;
}
export declare class AssignNewShipmentDto {
    idUser: number;
    idUserSubscriptions: number;
    idClub: number;
    idCourier: number;
    idAssignedRider?: number;
    boxMonthYear?: string;
}
