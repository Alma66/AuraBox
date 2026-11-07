import { ClubStatus } from '@prisma/client';
export declare class ChangeClubStatusDto {
    status: ClubStatus;
    reason?: string;
}
