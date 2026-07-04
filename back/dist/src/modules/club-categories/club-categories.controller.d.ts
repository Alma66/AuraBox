import { ClubCategoriesService } from './club-categories.service';
import { CreateClubCategoryDto } from './dto/create-club-category.dto';
import { UpdateClubCategoryDto } from './dto/update-club-category.dto';
export declare class ClubCategoriesController {
    private readonly service;
    constructor(service: ClubCategoriesService);
    create(dto: CreateClubCategoryDto): Promise<{
        id: number;
        idCategories: number;
        idClub: number;
    }>;
    findAll(): Promise<{
        id: number;
        idCategories: number;
        idClub: number;
    }[]>;
    findByClub(idClub: number): Promise<{
        id: number;
        idCategories: number;
        idClub: number;
    }[]>;
    findByCategory(idCategory: number): Promise<{
        id: number;
        idCategories: number;
        idClub: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        idCategories: number;
        idClub: number;
    }>;
    update(id: number, dto: UpdateClubCategoryDto): Promise<{
        id: number;
        idCategories: number;
        idClub: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
