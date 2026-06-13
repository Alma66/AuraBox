import { EntrepreneurClubService } from './entrepreneur-club.service';
import { CreateEntrepreneurClubDto } from './dto/create-entrepreneur-club.dto';
import { UpdateEntrepreneurClubDto } from './dto/update-entrepreneur-club.dto';
export declare class EntrepreneurClubController {
    private readonly service;
    constructor(service: EntrepreneurClubService);
    create(dto: CreateEntrepreneurClubDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findByClub(idClub: number): Promise<any[]>;
    findByEntrepreneur(idEntrepreneur: number, req: any): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateEntrepreneurClubDto, req: any): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
