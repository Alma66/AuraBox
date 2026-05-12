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
        email: string;
        documentNumber: number;
        firstName: string;
        lastName: string;
        passwordHash: string;
        documentType: import("@prisma/client").$Enums.DocumentType;
        phoneNumber: number | null;
        active: boolean;
        cuitCuil: number | null;
        registrationDate: Date;
        birthDate: Date | null;
        city: string | null;
        province: string | null;
    } | null>;
    update(id: number, dto: UpdateEntrepreneurDto): Promise<any>;
    deactivate(id: number): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
