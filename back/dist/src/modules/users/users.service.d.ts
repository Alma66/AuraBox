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
        phoneNumber: string | null;
        registrationDate: Date;
        birthDate: Date | null;
        city: string | null;
        province: string | null;
        active: boolean;
        gender: string | null;
        country: string | null;
        streetAddress: string | null;
        addressNumber: number | null;
        floorNumber: string | null;
        addressDetails: string | null;
        postalCode: string | null;
        showGenderPublicly: boolean;
        balanceAvailable: Prisma.Decimal | null;
        acceptsNewsletter: boolean;
        homeLatitude: Prisma.Decimal | null;
        homeLongitude: Prisma.Decimal | null;
    } | null>;
    update(id: number, dto: UpdateUserDto, requireCurrentPassword?: boolean): Promise<any>;
    verifyPassword(id: number, password: string): Promise<{
        ok: boolean;
    }>;
    deactivate(id: number, password: string): Promise<{
        ok: boolean;
    }>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
    findSubscribersByClub(idClub: number): Promise<any[]>;
    findNewsletterRecipients(idClub: number, requester: {
        id: number;
        role: string;
    }): Promise<any[]>;
}
