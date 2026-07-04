import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(dto: CreateCategoryDto): Promise<{
        name: string;
        description: string;
        id: number;
    }>;
    findAll(): Promise<{
        name: string;
        description: string;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        description: string;
        id: number;
    }>;
    update(id: number, dto: UpdateCategoryDto): Promise<{
        name: string;
        description: string;
        id: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
