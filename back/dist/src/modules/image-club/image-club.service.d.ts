import { PrismaService } from '../../prisma/prisma.service';
import { CreateImageClubDto } from './dto/create-image-club.dto';
import { UpdateImageClubDto } from './dto/update-image-club.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
type RequestUser = {
    id: number;
    role: string;
};
export declare class ImageClubService {
    private readonly prisma;
    private readonly cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    private assertClubAccess;
    private syncClubLogo;
    private assertNoLogoInUse;
    private deleteAssetIfUnused;
    create(dto: CreateImageClubDto, imageFile: Express.Multer.File | undefined, user: RequestUser): Promise<any>;
    findAll(): Promise<any[]>;
    findByClub(idClub: number, section?: string): Promise<any[]>;
    private ensureLogoImage;
    private backfillSection;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateImageClubDto, user: RequestUser): Promise<any>;
    remove(id: number, user: RequestUser): Promise<{
        message: string;
    }>;
    removeMany(ids: number[], user: RequestUser): Promise<{
        message: string;
    }>;
}
export {};
