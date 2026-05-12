import { PrismaService } from '../../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
export declare class ShipmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateShipmentDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByUser(idUser: number): Promise<any[]>;
    findByClub(idClub: number): Promise<any[]>;
    update(id: number, dto: UpdateShipmentDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
