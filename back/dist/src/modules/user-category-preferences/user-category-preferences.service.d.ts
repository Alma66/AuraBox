import { PrismaService } from '../../prisma/prisma.service';
export declare class UserCategoryPreferencesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByUser(idUser: number): Promise<{
        id: number;
        name: string;
        description: string;
    }[]>;
    replace(idUser: number, categoryIds: number[]): Promise<{
        id: number;
        name: string;
        description: string;
    }[]>;
}
