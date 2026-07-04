import { PrismaService } from '../../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { AssignDeliveryDto, AssignNewShipmentDto } from './dto/assign-delivery.dto';
export declare class ShipmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private validateCourierForClub;
    private validateRiderForClub;
    create(dto: CreateShipmentDto): Promise<any>;
    assignNewShipment(dto: AssignNewShipmentDto): Promise<any>;
    getPendingForClub(idClub: number): Promise<{
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
            phoneNumber: number | null;
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
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByUser(idUser: number): Promise<any[]>;
    findByClub(idClub: number): Promise<any[]>;
    update(id: number, dto: UpdateShipmentDto): Promise<any>;
    assignRiderForClub(id: number, idClub: number, dto: AssignDeliveryDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
