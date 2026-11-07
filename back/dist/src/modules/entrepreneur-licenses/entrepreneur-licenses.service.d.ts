import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntrepreneurLicenseDto } from './dto/create-entrepreneur-licenses.dto';
import { UpdateEntrepreneurLicenseDto } from './dto/update-entrepreneur-licenses.dto';
import { VerifyLicenseDto } from './dto/verify-license.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
type RequestUser = {
    id: number;
    role: string;
};
export declare class EntrepreneurLicensesService {
    private readonly prisma;
    private readonly cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    private assertDates;
    create(dto: CreateEntrepreneurLicenseDto, user: RequestUser, documentFile?: Express.Multer.File): Promise<any>;
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
    findByEntrepreneur(idEntrepreneur: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateEntrepreneurLicenseDto, user: RequestUser, documentFile?: Express.Multer.File): Promise<any>;
    verify(id: number, dto: VerifyLicenseDto): Promise<any>;
    findRequiredForClub(idClub: number, requesterId: number, requesterRole: string): Promise<{
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
    getMyCompliance(user: RequestUser): Promise<{
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
    remove(id: number): Promise<{
        message: string;
    }>;
}
export {};
