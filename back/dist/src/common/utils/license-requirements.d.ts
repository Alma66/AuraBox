import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare const EXPIRING_SOON_DAYS = 30;
export type RequirementState = 'FALTANTE' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'VENCIDA';
export declare const REQUIREMENT_STATE_LABELS: Record<RequirementState, string>;
export interface LicenseRequirement {
    idLicenseTypes: number;
    name: string;
    description: string | null;
    entrepreneurLicenseId: number | null;
    verificationStatus: VerificationStatus | null;
    state: RequirementState;
    documentUrl: string | null;
    issueDate: string | null;
    expirationDate: string | null;
    verificationNotes: string | null;
    verificationDate: string | null;
    daysToExpire: number | null;
    expiringSoon: boolean;
    valid: boolean;
}
export interface RequirementsSummary {
    required: number;
    approved: number;
    pending: number;
    rejected: number;
    missing: number;
    expired: number;
    expiringSoon: number;
    allValid: boolean;
}
export declare function summarizeRequirements(items: LicenseRequirement[]): RequirementsSummary;
export declare function getLicenseRequirements(prisma: PrismaService, idClub: number): Promise<{
    idEntrepreneur: number | null;
    items: LicenseRequirement[];
}>;
