import { PrismaService } from '../../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
export declare class FavoritesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateFavoriteDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByUser(idUser: number): Promise<any[]>;
    findByClub(idClub: number): Promise<any[]>;
    update(id: number, dto: UpdateFavoriteDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
