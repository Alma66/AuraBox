import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserClubPreferenceDto } from './dto/create-user-club-preference.dto';
import { UpdateUserClubPreferenceDto } from './dto/update-user-club-preference.dto';
type RequestUser = {
    id: number;
    role: string;
};
export declare class UserClubPreferencesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertClubAccess;
    private assertPreferenceAccess;
    create(dto: CreateUserClubPreferenceDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number, user: RequestUser): Promise<any>;
    findByUser(idUser: number): Promise<any[]>;
    findByClub(idClub: number, user: RequestUser): Promise<any[]>;
    findBySubscriptionType(idSubscriptionTypes: number, user: RequestUser): Promise<any[]>;
    update(id: number, dto: UpdateUserClubPreferenceDto, user: RequestUser): Promise<any>;
    remove(id: number, user: RequestUser): Promise<{
        message: string;
    }>;
}
export {};
