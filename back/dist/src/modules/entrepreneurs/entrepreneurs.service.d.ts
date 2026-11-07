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
        cuitCuil: bigint | null;
        phoneNumber: string | null;
        registrationDate: Date;
        birthDate: Date | null;
        city: string | null;
        province: string | null;
        active: boolean;
        bio: string | null;
        gender: string | null;
        country: string | null;
        streetAddress: string | null;
        addressNumber: number | null;
        floorNumber: string | null;
        addressDetails: string | null;
        postalCode: string | null;
        showGenderPublicly: boolean;
    } | null>;
    update(id: number, dto: UpdateEntrepreneurDto, requireCurrentPassword?: boolean): Promise<any>;
    verifyPassword(id: number, password: string): Promise<{
        ok: boolean;
    }>;
    deactivate(id: number): Promise<any>;
    deactivateSelf(id: number, password: string): Promise<{
        ok: boolean;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
