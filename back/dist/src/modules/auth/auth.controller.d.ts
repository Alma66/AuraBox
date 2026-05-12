import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthController {
    private readonly authService;
    private readonly prisma;
    constructor(authService: AuthService, prisma: PrismaService);
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    register(dto: any): Promise<{
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
    } | {
        id: number;
        email: string;
        documentNumber: number;
        firstName: string;
        lastName: string;
        passwordHash: string;
        documentType: import("@prisma/client").$Enums.DocumentType;
        phoneNumber: number | null;
        active: boolean;
        registrationDate: Date;
        birthDate: Date | null;
        city: string | null;
        province: string | null;
        balanceAvailable: import("@prisma/client/runtime/library").Decimal | null;
        streetAddress: string | null;
        addressNumber: number | null;
        floorNumber: string | null;
        addressDetails: string | null;
        postalCode: string | null;
    }>;
}
