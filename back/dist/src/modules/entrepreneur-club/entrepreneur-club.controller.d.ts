import { EntrepreneurClubService } from './entrepreneur-club.service';
import { CreateEntrepreneurClubDto } from './dto/create-entrepreneur-club.dto';
import { UpdateEntrepreneurClubDto } from './dto/update-entrepreneur-club.dto';
export declare class EntrepreneurClubController {
    private readonly service;
    constructor(service: EntrepreneurClubService);
    create(dto: CreateEntrepreneurClubDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByClub(idClub: number): Promise<any[]>;
    findByEntrepreneur(idEntrepreneur: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateEntrepreneurClubDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
