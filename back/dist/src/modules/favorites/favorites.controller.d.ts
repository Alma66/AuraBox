import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    create(dto: CreateFavoriteDto, req: any): Promise<any>;
    toggle(idSubscriptionTypes: number, req: any): Promise<{
        isFavorite: boolean;
    }>;
    findAll(): Promise<any[]>;
    findByUser(idUser: number, req: any): Promise<{
        favoriteId: number;
        idSubscriptionTypes: number;
        dateAdded: string;
        plan: {
            planId: any;
            name: any;
            description: any;
            price: number;
            currency: string;
            deliveryFrequency: any;
            image: any;
            includes: string[];
            active: any;
            cashDiscount: number;
            transferDiscount: number;
        };
        club: {
            id: number;
            name: string;
            logoUrl: string;
            slogan: string | null;
        };
    }[]>;
    findByPlan(idSubscriptionTypes: number, req: any): Promise<any[]>;
    check(idSubscriptionTypes: number, req: any): Promise<{
        isFavorite: boolean;
    }>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdateFavoriteDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
