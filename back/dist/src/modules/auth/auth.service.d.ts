import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CompleteCustomerProfileDto, CreateClubDto, RegisterClubDto, RegisterCustomerDto, RegisterEntrepreneurDto } from './dto/register.dto';
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
    private signRegistrationToken;
    private verifyRegistrationToken;
    private emailInUse;
    private resolveRequiredRules;
    registerCustomer(dto: RegisterCustomerDto): Promise<any>;
    completeCustomerProfile(dto: CompleteCustomerProfileDto): Promise<any>;
    registerEntrepreneur(dto: RegisterEntrepreneurDto): Promise<any>;
    private createClubFor;
    registerEntrepreneurClub(dto: RegisterClubDto): Promise<{
        id: number;
        name: string;
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
        communityText: string | null;
        milestones: string | null;
        shippingWindowStartDay: number | null;
        shippingWindowEndDay: number | null;
        bankHolder: string | null;
        bankCbu: string | null;
        bankAlias: string | null;
    }>;
    createClubForSession(entrepreneurId: number, dto: CreateClubDto): Promise<{
        club: {
            id: number;
            name: string;
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
            communityText: string | null;
            milestones: string | null;
            shippingWindowStartDay: number | null;
            shippingWindowEndDay: number | null;
            bankHolder: string | null;
            bankCbu: string | null;
            bankAlias: string | null;
        };
        access_token: string;
    }>;
}
