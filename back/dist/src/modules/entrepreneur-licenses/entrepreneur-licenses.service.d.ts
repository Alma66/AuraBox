import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntrepreneurLicenseDto } from './dto/create-entrepreneur-licenses.dto';
import { UpdateEntrepreneurLicenseDto } from './dto/update-entrepreneur-licenses.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class EntrepreneurLicensesService {
    private readonly prisma;
    private readonly cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    create(dto: CreateEntrepreneurLicenseDto, documentFile?: Express.Multer.File): Promise<any>;
    findAll(): Promise<any[]>;
    findByEntrepreneur(idEntrepreneur: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateEntrepreneurLicenseDto): Promise<any>;
    verify(id: number, verificationStatus: string, verificationNotes?: string): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
