import { ClubStatusHistoryService } from './club-status-history.service';
import { CreateClubStatusHistoryDto } from './dto/create-club-status-history.dto';
import { UpdateClubStatusHistoryDto } from './dto/update-club-status-history.dto';
export declare class ClubStatusHistoryController {
    private readonly svc;
    constructor(svc: ClubStatusHistoryService);
    create(dto: CreateClubStatusHistoryDto): Promise<{
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: boolean;
        changeReason: string | null;
        id: number;
    }>;
    findAll(): Promise<{
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: boolean;
        changeReason: string | null;
        id: number;
    }[]>;
    findByClub(idClub: number): Promise<{
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: boolean;
        changeReason: string | null;
        id: number;
    }[]>;
    findByAdmin(idAdmin: number): Promise<{
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: boolean;
        changeReason: string | null;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: boolean;
        changeReason: string | null;
        id: number;
    }>;
    update(id: number, dto: UpdateClubStatusHistoryDto): Promise<{
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: boolean;
        changeReason: string | null;
        id: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
