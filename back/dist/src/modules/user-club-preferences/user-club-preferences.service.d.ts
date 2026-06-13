import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserClubPreferenceDto } from './dto/create-user-club-preference.dto';
import { UpdateUserClubPreferenceDto } from './dto/update-user-club-preference.dto';
export declare class UserClubPreferencesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserClubPreferenceDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByUser(idUser: number): Promise<any[]>;
    findByClub(idClub: number): Promise<any[]>;
    findBySubscriptionType(idSubscriptionTypes: number): Promise<any[]>;
    update(id: number, dto: UpdateUserClubPreferenceDto, user: any): Promise<any>;
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
}
