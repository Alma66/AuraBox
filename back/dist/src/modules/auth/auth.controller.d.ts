import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { CompleteCustomerProfileDto, CreateClubDto, RegisterClubDto, RegisterCustomerDto, RegisterEntrepreneurDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    registerCustomer(dto: RegisterCustomerDto): Promise<any>;
    registerEntrepreneur(dto: RegisterEntrepreneurDto): Promise<any>;
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
    completeCustomerProfile(dto: CompleteCustomerProfileDto): Promise<any>;
    createClubForSession(dto: CreateClubDto, req: any): Promise<{
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
