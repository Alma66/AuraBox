import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubLegalContentDto } from './dto/create-club-legal-content.dto';
import { UpdateClubLegalContentDto } from './dto/update-club-legal-content.dto';
import { OptionalRequestUser } from '../../common/utils/club-visibility';
export declare class ClubLegalContentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertOwnership;
    findByClub(idClub: number, user: OptionalRequestUser): Promise<{
        id: number;
        idClub: number;
        updatedAt: Date;
        termsAndConditions: import("@prisma/client/runtime/library").JsonValue | null;
        privacyAndSecurityPolicy: import("@prisma/client/runtime/library").JsonValue | null;
    } | {
        idClub: number;
        termsAndConditions: never[];
        privacyAndSecurityPolicy: never[];
    }>;
    upsert(idClub: number, dto: CreateClubLegalContentDto | UpdateClubLegalContentDto, entrepreneurId: number): Promise<{
        id: number;
        idClub: number;
        updatedAt: Date;
        termsAndConditions: import("@prisma/client/runtime/library").JsonValue | null;
        privacyAndSecurityPolicy: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
