import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(dto: CreateCategoryDto): Promise<{
        id: number;
        name: string;
        description: string;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        description: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        description: string;
    }>;
    update(id: number, dto: UpdateCategoryDto): Promise<{
        id: number;
        name: string;
        description: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
