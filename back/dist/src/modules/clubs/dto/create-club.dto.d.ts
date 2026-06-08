import { ClubStatus } from '@prisma/client';
export declare class CreateClubDto {
    name: string;
    logoUrl?: string;
    slogan?: string;
    history?: string;
    shortDescription: string;
    contactEmail: string;
    whatsappContact?: string;
    clubStatus?: ClubStatus;
}
