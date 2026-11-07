import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly prisma;
    constructor(analyticsService: AnalyticsService, prisma: PrismaService);
    private assertClubAccess;
    getClubStats(idClub: number, req: any): Promise<{
        activeSubscribers: number;
        newThisMonth: number;
        cancelledThisMonth: number;
        retentionRate: number;
        avgTicket: string;
        mrr: string;
        subscriberEvolution: {
            month: string;
            count: number;
        }[];
        shipmentStatusBreakdown: {
            status: string;
            count: number;
        }[];
        reputationSummary: {
            avgRating: number;
            totalReviews: number;
            withMediaPercent: number;
            hiddenCount: number;
        };
        topSubscriptionTypes: {
            name: string;
            activeCount: number;
        }[];
    }>;
    getSalesReport(idClub: number, req: any, from?: string, to?: string, idSubscriptionTypes?: string, paymentStatus?: string, idPaymentMethods?: string, page?: string, pageSize?: string): Promise<{
        totalRevenue: string;
        successfulPaymentsCount: number;
        avgTicket: string;
        monthlyRevenue: {
            month: string;
            current: number;
            previous: number;
        }[];
        byPaymentMethod: {
            method: string;
            amount: number;
        }[];
        bySubscriptionType: {
            name: string;
            amount: number;
        }[];
        payments: {
            id: number;
            paymentDate: string | null;
            idUser: number;
            idUserSubscription: number;
            idPaymentMethods: number | null;
            totalAmountPaid: string;
            clubAmount: string;
            commissionAmount: string;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            idGatewayTransaction: string | null;
        }[];
        totalCount: number;
    }>;
    getSalesReportExport(idClub: number, req: any, from?: string, to?: string, idSubscriptionTypes?: string, paymentStatus?: string, idPaymentMethods?: string): Promise<{
        id: number;
        fecha: string | null;
        idUsuario: number;
        idSuscripcion: number;
        metodoPago: string | number;
        montoTotal: string;
        montoClub: string;
        comision: string;
        estado: import("@prisma/client").$Enums.PaymentStatus;
        transaccion: string;
    }[]>;
    getFeedbackTrends(idClub: number, req: any): Promise<{
        ratingEvolution: {
            month: string;
            avgRating: number;
        }[];
        reviewConversionRate: number;
        subscriberFlux: {
            month: string;
            newSubs: number;
            cancelledSubs: number;
        }[];
        topReviews: {
            id: number;
            rating: number;
            title: string | null;
            comment: string | null;
            reviewDate: string | null;
            idUser: number;
            mediaUrl: string | null;
        }[];
        bottomReviews: {
            id: number;
            rating: number;
            title: string | null;
            comment: string | null;
            reviewDate: string | null;
            idUser: number;
            mediaUrl: string | null;
        }[];
        frequentWords: {
            word: string;
            count: number;
        }[];
    }>;
}
