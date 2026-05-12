import { PrismaService } from '../../prisma/prisma.service';
import { CreateBoxContentHistoryDto } from './dto/create-box-content-history.dto';
import { UpdateBoxContentHistoryDto } from './dto/update-box-content-history.dto';
export declare class BoxContentHistoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateBoxContentHistoryDto): Promise<any>;
    findAll(page?: number, perPage?: number): Promise<any[]>;
    findBySubscriptionType(idSubscriptionTypes: number): Promise<any[]>;
    findByDeliveryMonth(deliveryMonthYear: string): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateBoxContentHistoryDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
