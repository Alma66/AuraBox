import { PaymentMethodCode } from '../../payments/payments.constants';
export declare class UpdateClubBillingDto {
    bankHolder?: string | null;
    bankCbu?: string | null;
    bankAlias?: string | null;
    methods: PaymentMethodCode[];
}
