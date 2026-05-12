import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
export declare class ClubsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(ownerId: number, dto: CreateClubDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, userId: number, userRole: string, dto: UpdateClubDto): Promise<any>;
    remove(id: number, userRole: string): Promise<{
        message: string;
    }>;
}
