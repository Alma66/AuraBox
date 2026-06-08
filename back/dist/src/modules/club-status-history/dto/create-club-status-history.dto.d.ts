import { ClubStatus } from '@prisma/client';
export declare class CreateClubStatusHistoryDto {
    idClub: number;
    idAdmins: number;
    previousStatus: ClubStatus;
    newStatus: ClubStatus;
    changeDate?: string;
    changeReason?: string;
}
