import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntrepreneurClubDto } from './dto/create-entrepreneur-club.dto';
import { UpdateEntrepreneurClubDto } from './dto/update-entrepreneur-club.dto';
export declare class EntrepreneurClubService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
