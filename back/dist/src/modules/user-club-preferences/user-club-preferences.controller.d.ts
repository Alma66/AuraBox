import { UserClubPreferencesService } from './user-club-preferences.service';
import { CreateUserClubPreferenceDto } from './dto/create-user-club-preference.dto';
import { UpdateUserClubPreferenceDto } from './dto/update-user-club-preference.dto';
export declare class UserClubPreferencesController {
    private readonly svc;
    constructor(svc: UserClubPreferencesService);
    create(dto: CreateUserClubPreferenceDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findByUser(idUser: number, req: any): Promise<any[]>;
    findByClub(idClub: number, req: any): Promise<any[]>;
    findBySubscriptionType(idSubscriptionTypes: number, req: any): Promise<any[]>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdateUserClubPreferenceDto, req: any): Promise<any>;
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
}
