import { PrismaService } from '../../prisma/prisma.service';
import { UpdateClubBillingDto } from './dto/update-club-billing.dto';
type RequestUser = {
    id: number;
    role: string;
};
export declare class ClubBillingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertAccess;
    get(clubId: number, user: RequestUser): Promise<{
        bankHolder: string | null;
        bankCbu: string | null;
        bankAlias: string | null;
        methods: import("../payments/payments.constants").PaymentMethodCode[];
    }>;
    update(clubId: number, dto: UpdateClubBillingDto, user: RequestUser): Promise<{
        bankHolder: string | null;
        bankCbu: string | null;
        bankAlias: string | null;
        methods: import("../payments/payments.constants").PaymentMethodCode[];
    }>;
}
export {};
