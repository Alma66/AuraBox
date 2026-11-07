import { PrismaService } from '../../prisma/prisma.service';
import { PaymentMethodCode } from '../../modules/payments/payments.constants';
export declare const findOrCreateMethod: (prisma: PrismaService, code: PaymentMethodCode) => Promise<{
    id: number;
    active: boolean;
    method: string;
}>;
export declare const getAcceptedCodes: (prisma: PrismaService, clubId: number) => Promise<PaymentMethodCode[]>;
export declare const saveAcceptedCodes: (prisma: PrismaService, clubId: number, codes: PaymentMethodCode[]) => Promise<void>;
