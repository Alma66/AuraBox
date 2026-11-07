import { PrismaService } from '../../prisma/prisma.service';
import { ChangeClubStatusDto } from './dto/change-club-status.dto';
import { SetReviewVisibilityDto } from './dto/set-review-visibility.dto';
export declare class AdminPanelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        clubs: {
            total: number;
            pending: number;
            approved: number;
            suspended: number;
            inactive: number;
        };
        customers: number;
        entrepreneurs: number;
        activeSubscriptions: number;
        reviews: number;
        revenue: {
            total: number;
            commission: number;
        };
        monthly: {
            month: string;
            total: number;
            commission: number;
        }[];
        pendingClubs: {
            id: number;
            name: string;
            creationDate: string;
        }[];
    }>;
    findClubs(status?: string): Promise<{
        id: number;
        name: string;
        logoUrl: string;
        shortDescription: string;
        contactEmail: string;
        clubStatus: import("@prisma/client").$Enums.ClubStatus;
        creationDate: string;
        averageRating: number | null;
        totalReviews: number;
        owner: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
        } | null;
    }[]>;
    changeClubStatus(clubId: number, adminId: number, dto: ChangeClubStatusDto): Promise<{
        id: number;
        clubStatus: import("@prisma/client").$Enums.ClubStatus;
    }>;
    findClubStatusHistory(clubId: number): Promise<{
        id: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeReason: string | null;
        changeDate: string;
        admin: string | null;
    }[]>;
    findAccounts(type: string, search?: string): Promise<{
        registrationDate: string;
        club: {
            id: number;
            name: string;
            clubStatus: import("@prisma/client").$Enums.ClubStatus;
        } | null;
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        active: boolean;
    }[]>;
    setAccountActive(type: string, id: number, active: boolean): Promise<{
        id: number;
        active: boolean;
    }>;
    findPayments(clubIdRaw?: string, month?: string): Promise<{
        totals: {
            count: number;
            total: number;
            clubAmount: number;
            commission: number;
        };
        perClub: {
            idClub: number;
            club: string;
            count: number;
            total: number;
            clubAmount: number;
            commission: number;
        }[];
        payments: {
            id: number;
            paymentDate: string;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            total: number;
            clubAmount: number;
            commission: number;
            club: string;
            customer: string | null;
            method: string | null;
            gatewayTransaction: string | null;
        }[];
        truncated: boolean;
    }>;
    findReviews(filter?: string): Promise<{
        id: number;
        rating: number;
        title: string | null;
        comment: string | null;
        reviewDate: string;
        isHidden: boolean;
        hiddenReason: string | null;
        mediaCount: number;
        customer: string | null;
        club: string | null;
    }[]>;
    setReviewVisibility(id: number, dto: SetReviewVisibilityDto): Promise<{
        id: number;
        isHidden: boolean;
    }>;
}
