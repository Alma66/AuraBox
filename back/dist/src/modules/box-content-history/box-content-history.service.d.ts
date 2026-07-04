import { PrismaService } from '../../prisma/prisma.service';
import { CreateBoxContentHistoryDto } from './dto/create-box-content-history.dto';
import { UpdateBoxContentHistoryDto } from './dto/update-box-content-history.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class BoxContentHistoryService {
    private readonly prisma;
    private readonly cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    create(dto: CreateBoxContentHistoryDto, imageFile?: Express.Multer.File): Promise<any>;
    findAll(page?: number, perPage?: number): Promise<any[]>;
    findBySubscriptionType(idSubscriptionTypes: number): Promise<any[]>;
    findByDeliveryMonth(deliveryMonthYear: string): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateBoxContentHistoryDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
