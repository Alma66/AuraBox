import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class ClubsService {
    private readonly prisma;
    private readonly cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    create(ownerId: number, dto: CreateClubDto, logoFile?: Express.Multer.File): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findFeatured(): Promise<any[]>;
    update(id: number, userId: number, userRole: string, dto: UpdateClubDto): Promise<any>;
    remove(id: number, userRole: string): Promise<{
        message: string;
    }>;
}
