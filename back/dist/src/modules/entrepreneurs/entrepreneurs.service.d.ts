import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntrepreneurDto } from './dto/create-entrepreneurs.dto';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneurs.dto';
export declare class EntrepreneursService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateEntrepreneurDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByEmail(email: string): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        passwordHash: string;
        documentType: import("@prisma/client").$Enums.DocumentType;
        documentNumber: number;
        phoneNumber: number | null;
        active: boolean;
        registrationDate: Date;
        birthDate: Date | null;
        city: string | null;
        province: string | null;
        cuitCuil: number | null;
    } | null>;
    update(id: number, dto: UpdateEntrepreneurDto): Promise<any>;
    deactivate(id: number): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
