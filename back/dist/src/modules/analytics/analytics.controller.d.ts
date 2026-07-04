import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getClubStats(idClub: number): Promise<{
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
    getSalesReport(idClub: number, from?: string, to?: string, idSubscriptionTypes?: string, paymentStatus?: string, idPaymentMethods?: string, page?: string, pageSize?: string): Promise<{
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
    getSalesReportExport(idClub: number, from?: string, to?: string, idSubscriptionTypes?: string, paymentStatus?: string, idPaymentMethods?: string): Promise<{
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
    getFeedbackTrends(idClub: number): Promise<{
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
