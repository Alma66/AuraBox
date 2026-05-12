import { PrismaService } from '../../prisma/prisma.service';
import { CreateImageClubDto } from './dto/create-image-club.dto';
import { UpdateImageClubDto } from './dto/update-image-club.dto';
export declare class ImageClubService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateImageClubDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByClub(idClub: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateImageClubDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
