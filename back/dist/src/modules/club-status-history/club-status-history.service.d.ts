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
    findByAdmin(idAdmins: number): Promise<{
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
