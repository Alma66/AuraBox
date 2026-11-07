import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { AssignDeliveryDto, AssignNewShipmentDto } from './dto/assign-delivery.dto';
export declare class ShipmentsController {
    private readonly shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    create(dto: CreateShipmentDto): Promise<any>;
    assignNew(dto: AssignNewShipmentDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findByUser(idUser: number, req: any): Promise<any[]>;
    findByClub(idClub: number, req: any): Promise<any[]>;
    findPendingByClub(idClub: number, req: any): Promise<{
        idUserSubscriptions: number;
        idUser: number;
        idSubscriptionTypes: number;
        subscriptionName: string | null;
        boxMonthYear: string;
        user: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string | null;
            address: {
                street: string | null;
                addressNumber: number | null;
                floorNumber: string | null;
                addressDetails: string | null;
                city: string | null;
                postalCode: string | null;
                province: string | null;
            };
        } | null;
        availableCouriers: {
            id: number;
            code: string;
            name: string;
            isInternal: boolean;
        }[];
    }[]>;
    findOne(id: number, req: any): Promise<any>;
    assignExisting(id: number, idClub: number, dto: AssignDeliveryDto, req: any): Promise<any>;
    update(id: number, dto: UpdateShipmentDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
