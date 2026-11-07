import { PrismaService } from '../../prisma/prisma.service';
export type OptionalRequestUser = {
    id: number;
    role: string;
} | null | undefined;
export declare function canViewClub(prisma: PrismaService, idClub: number, user: OptionalRequestUser): Promise<boolean>;
export declare function assertClubVisible(prisma: PrismaService, idClub: number, user: OptionalRequestUser): Promise<void>;
