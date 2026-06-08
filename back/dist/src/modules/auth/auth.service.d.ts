import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService);
    validateUser(email: string, pass: string): Promise<any>;
    loginWithCredentials(email: string, password: string): Promise<{
        access_token: string;
    }>;
    buildToken(user: any): Promise<{
        access_token: string;
    }>;
    registerCustomer(dto: any): Promise<any>;
    completeCustomerProfile(dto: any): Promise<any>;
    registerEntrepreneur(dto: any): Promise<any>;
    registerEntrepreneurClub(dto: any): Promise<{
        name: string;
        id: number;
        logoUrl: string;
        slogan: string | null;
        history: string | null;
        shortDescription: string;
        contactEmail: string;
        whatsappContact: string | null;
        clubStatus: import("@prisma/client").$Enums.ClubStatus;
        creationDate: Date;
        averageRating: import("@prisma/client/runtime/library").Decimal | null;
        totalReviews: number;
    }>;
}
