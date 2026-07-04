import { EntrepreneursService } from './entrepreneurs.service';
import { CreateEntrepreneurDto } from './dto/create-entrepreneurs.dto';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneurs.dto';
import { ClubsService } from '../clubs/clubs.service';
export declare class EntrepreneursController {
    private readonly entrepreneursService;
    private readonly clubsService;
    constructor(entrepreneursService: EntrepreneursService, clubsService: ClubsService);
    create(dto: CreateEntrepreneurDto): Promise<any>;
    getMe(req: any): Promise<any>;
    verifyPassword(req: any, body: {
        password: string;
    }): Promise<{
        ok: boolean;
    }>;
    updateMe(req: any, dto: UpdateEntrepreneurDto): Promise<any>;
    getMyClub(req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdateEntrepreneurDto, req: any): Promise<any>;
    deactivate(id: number): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
