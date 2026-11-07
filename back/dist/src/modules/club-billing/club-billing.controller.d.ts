import { ClubBillingService } from './club-billing.service';
import { UpdateClubBillingDto } from './dto/update-club-billing.dto';
export declare class ClubBillingController {
    private readonly service;
    constructor(service: ClubBillingService);
    get(id: number, req: any): Promise<{
        bankHolder: string | null;
        bankCbu: string | null;
        bankAlias: string | null;
        methods: import("../payments/payments.constants").PaymentMethodCode[];
    }>;
    update(id: number, dto: UpdateClubBillingDto, req: any): Promise<{
        bankHolder: string | null;
        bankCbu: string | null;
        bankAlias: string | null;
        methods: import("../payments/payments.constants").PaymentMethodCode[];
    }>;
}
