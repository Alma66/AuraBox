import { PrismaService } from '../../prisma/prisma.service';
import { CreateBoxContentHistoryDto } from './dto/create-box-content-history.dto';
import { UpdateBoxContentHistoryDto } from './dto/update-box-content-history.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
type RequestUser = {
    id: number;
    role: string;
};
export declare class BoxContentHistoryService {
    private readonly prisma;
    private readonly cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    private assertOwnership;
    private assertCustomerAccess;
    private assertReadAccess;
    create(dto: CreateBoxContentHistoryDto, imageFile?: Express.Multer.File, requesterId?: number, requesterRole?: string): Promise<any>;
    findAll(page?: number, perPage?: number): Promise<any[]>;
    findBySubscriptionType(idSubscriptionTypes: number, user: RequestUser): Promise<any[]>;
    findByDeliveryMonth(deliveryMonthYear: string): Promise<any[]>;
    findOne(id: number, user: RequestUser): Promise<any>;
    update(id: number, dto: UpdateBoxContentHistoryDto, requesterId?: number, requesterRole?: string): Promise<any>;
    remove(id: number, requesterId?: number, requesterRole?: string): Promise<{
        message: string;
    }>;
}
export {};
