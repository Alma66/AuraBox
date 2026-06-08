import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<any>;
    findAll(): Promise<any[]>;
    findById(id: number): Promise<any>;
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
        balanceAvailable: Prisma.Decimal | null;
        streetAddress: string | null;
        addressNumber: number | null;
        floorNumber: string | null;
        addressDetails: string | null;
        city: string | null;
        province: string | null;
        postalCode: string | null;
    } | null>;
    update(id: number, dto: UpdateUserDto): Promise<any>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
}
