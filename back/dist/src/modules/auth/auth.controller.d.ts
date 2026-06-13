import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    registerCustomer(dto: any): Promise<any>;
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
    completeCustomerProfile(dto: any): Promise<any>;
}
