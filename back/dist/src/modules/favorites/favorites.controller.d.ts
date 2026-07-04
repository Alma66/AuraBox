import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    create(dto: CreateFavoriteDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findByUser(idUser: number, req: any): Promise<any[]>;
    findByClub(idClub: number): Promise<any[]>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdateFavoriteDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
