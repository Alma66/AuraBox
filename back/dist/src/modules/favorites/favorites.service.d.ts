import { PrismaService } from '../../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
export declare class FavoritesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateFavoriteDto & {
        idUser: number;
    }): Promise<any>;
    toggle(idUser: number, idSubscriptionTypes: number): Promise<{
        isFavorite: boolean;
    }>;
    check(idUser: number, idSubscriptionTypes: number): Promise<{
        isFavorite: boolean;
    }>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByUserEnriched(idUser: number): Promise<{
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
    findByPlan(idSubscriptionTypes: number): Promise<any[]>;
    findByPlanForRequester(idSubscriptionTypes: number, user: {
        id: number;
        role: string;
    }): Promise<any[]>;
    update(id: number, dto: UpdateFavoriteDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
