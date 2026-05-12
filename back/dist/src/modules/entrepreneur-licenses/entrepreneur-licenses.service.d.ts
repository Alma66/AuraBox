import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntrepreneurLicenseDto } from './dto/create-entrepreneur-licenses.dto';
import { UpdateEntrepreneurLicenseDto } from './dto/update-entrepreneur-licenses.dto';
export declare class EntrepreneurLicensesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateEntrepreneurLicenseDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByEntrepreneur(idEntrepreneur: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateEntrepreneurLicenseDto): Promise<any>;
    verify(id: number, verificationStatus: string, verificationNotes?: string): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
