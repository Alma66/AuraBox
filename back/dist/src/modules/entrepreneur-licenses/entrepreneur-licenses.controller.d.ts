import { EntrepreneurLicensesService } from './entrepreneur-licenses.service';
import { CreateEntrepreneurLicenseDto } from './dto/create-entrepreneur-licenses.dto';
import { UpdateEntrepreneurLicenseDto } from './dto/update-entrepreneur-licenses.dto';
import { VerifyLicenseDto } from './dto/verify-license.dto';
export declare class EntrepreneurLicensesController {
    private readonly service;
    constructor(service: EntrepreneurLicensesService);
    create(dto: CreateEntrepreneurLicenseDto, req: any, document?: Express.Multer.File): Promise<any>;
    getMyCompliance(req: any): Promise<{
        hasClub: boolean;
        isOwner?: undefined;
        club?: undefined;
        statusReason?: undefined;
        statusChangedAt?: undefined;
        requirements?: undefined;
        summary?: undefined;
    } | {
        hasClub: boolean;
        isOwner: boolean;
        club: {
            id: number;
            name: string;
            clubStatus: import("@prisma/client").$Enums.ClubStatus;
        };
        statusReason: string | null;
        statusChangedAt: string | null;
        requirements: import("../../common/utils/license-requirements").LicenseRequirement[];
        summary: import("../../common/utils/license-requirements").RequirementsSummary;
    }>;
    adminList(status?: string): Promise<{
        id: number;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
        documentUrl: string | null;
        issueDate: string | null;
        expirationDate: string | null;
        verificationDate: string | null;
        verificationNotes: string | null;
        daysToExpire: number | null;
        licenseType: string;
        entrepreneur: {
            id: number;
            name: string;
            email: string;
        } | null;
        clubs: {
            id: number;
            name: string;
            clubStatus: import("@prisma/client").$Enums.ClubStatus;
        }[];
    }[]>;
    findByEntrepreneur(idEntrepreneur: number, req: any): Promise<any[]>;
    findRequiredForClub(idClub: number, req: any): Promise<{
        idLicenseTypes: number;
        name: string;
        description: string | null;
        entrepreneurLicenseId: number | null;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus | null;
        documentUrl: string | null;
        issueDate: string | null;
        expirationDate: string | null;
        verificationNotes: string | null;
    }[]>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdateEntrepreneurLicenseDto, req: any, document?: Express.Multer.File): Promise<any>;
    verify(id: number, dto: VerifyLicenseDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
