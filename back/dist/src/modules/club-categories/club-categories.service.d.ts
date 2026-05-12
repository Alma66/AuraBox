import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubCategoryDto } from './dto/create-club-category.dto';
import { UpdateClubCategoryDto } from './dto/update-club-category.dto';
export declare class ClubCategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateClubCategoryDto): Promise<{
        id: number;
        idClub: number;
        idCategories: number;
    }>;
    findAll(): Promise<{
        id: number;
        idClub: number;
        idCategories: number;
    }[]>;
    findByClub(idClub: number): Promise<{
        id: number;
        idClub: number;
        idCategories: number;
    }[]>;
    findByCategory(idCategory: number): Promise<{
        id: number;
        idClub: number;
        idCategories: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        idClub: number;
        idCategories: number;
    }>;
    update(id: number, dto: UpdateClubCategoryDto): Promise<{
        id: number;
        idClub: number;
        idCategories: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
