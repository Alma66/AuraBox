import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubStatusHistoryDto } from './dto/create-club-status-history.dto';
import { UpdateClubStatusHistoryDto } from './dto/update-club-status-history.dto';
export declare class ClubStatusHistoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateClubStatusHistoryDto): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: Date;
        changeReason: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: Date;
        changeReason: string | null;
    }[]>;
    findByClub(idClub: number): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: Date;
        changeReason: string | null;
    }[]>;
    findByAdmin(idAdmins: number): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: Date;
        changeReason: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: Date;
        changeReason: string | null;
    }>;
    update(id: number, dto: UpdateClubStatusHistoryDto): Promise<{
        id: number;
        idClub: number;
        idAdmins: number;
        previousStatus: import("@prisma/client").$Enums.ClubStatus;
        newStatus: import("@prisma/client").$Enums.ClubStatus;
        changeDate: Date;
        changeReason: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
