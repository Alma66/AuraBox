import { ClubStatusHistoryService } from './club-status-history.service';
import { CreateClubStatusHistoryDto } from './dto/create-club-status-history.dto';
import { UpdateClubStatusHistoryDto } from './dto/update-club-status-history.dto';
export declare class ClubStatusHistoryController {
    private readonly svc;
    constructor(svc: ClubStatusHistoryService);
    create(dto: CreateClubStatusHistoryDto): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeReason: string | null;
        changeDate: Date;
    }>;
    findAll(): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeReason: string | null;
        changeDate: Date;
    }[]>;
    findByClub(idClub: number): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeReason: string | null;
        changeDate: Date;
    }[]>;
    findByAdmin(idAdmin: number): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeReason: string | null;
        changeDate: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeReason: string | null;
        changeDate: Date;
    }>;
    update(id: number, dto: UpdateClubStatusHistoryDto): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeReason: string | null;
        changeDate: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
