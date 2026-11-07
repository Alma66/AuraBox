import { ClubLegalContentService } from './club-legal-content.service';
import { UpdateClubLegalContentDto } from './dto/update-club-legal-content.dto';
export declare class ClubLegalContentController {
    private readonly service;
    constructor(service: ClubLegalContentService);
    findByClub(idClub: number, req: any): Promise<{
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
    upsert(idClub: number, dto: UpdateClubLegalContentDto, req: any): Promise<{
        id: number;
        idClub: number;
        updatedAt: Date;
        termsAndConditions: import("@prisma/client/runtime/library").JsonValue | null;
        privacyAndSecurityPolicy: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
