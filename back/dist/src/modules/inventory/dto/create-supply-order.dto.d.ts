import { SupplyOrderStatus } from '@prisma/client';
export declare class CreateSupplyOrderDto {
    idClub: number;
    idSupplier: number;
    idProductInventory: number;
    quantity: number;
    totalCost: number;
    status?: SupplyOrderStatus;
    estimatedArrival?: string;
    notes?: string;
}
