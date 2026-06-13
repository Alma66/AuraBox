import { PrismaService } from '../../prisma/prisma.service';
import { CreateImageClubDto } from './dto/create-image-club.dto';
import { UpdateImageClubDto } from './dto/update-image-club.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class ImageClubService {
    private readonly prisma;
    private readonly cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    create(dto: CreateImageClubDto, imageFile?: Express.Multer.File): Promise<any>;
    findAll(): Promise<any[]>;
    findByClub(idClub: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateImageClubDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
