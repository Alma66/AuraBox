import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-types.dto';
import { UpdateSubscriptionTypeDto } from './dto/update-subscription-types.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class SubscriptionTypesService {
    private readonly prisma;
    private readonly cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    private assertEntrepreneurOwnsClub;
    create(dto: CreateSubscriptionTypeDto, requesterId?: number, requesterRole?: string): Promise<any>;
    findAll(): Promise<any[]>;
    findById(id: number): Promise<any>;
    findByClub(idClub: number): Promise<any[]>;
    update(id: number, dto: UpdateSubscriptionTypeDto, requesterId?: number, requesterRole?: string): Promise<any>;
    updateImage(id: number, imageFile: Express.Multer.File, requesterId?: number, requesterRole?: string): Promise<{
        imageUrl: string | null;
    }>;
    remove(id: number, requesterId?: number, requesterRole?: string): Promise<{
        ok: boolean;
    }>;
}
