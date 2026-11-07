import { UserCategoryPreferencesService } from './user-category-preferences.service';
import { SetUserCategoryPreferencesDto } from './dto/set-user-category-preferences.dto';
export declare class UserCategoryPreferencesController {
    private readonly svc;
    constructor(svc: UserCategoryPreferencesService);
    getMine(req: any): Promise<{
        id: number;
        name: string;
        description: string;
    }[]>;
    setMine(dto: SetUserCategoryPreferencesDto, req: any): Promise<{
        id: number;
        name: string;
        description: string;
    }[]>;
}
