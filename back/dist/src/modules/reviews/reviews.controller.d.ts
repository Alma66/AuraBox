import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateForbiddenWordDto } from './dto/create-forbidden-word.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(dto: CreateReviewDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findByUser(idUser: number, req: any): Promise<any[]>;
    findByClub(idClub: number, includeHidden?: string): Promise<any[]>;
    findHiddenByClub(idClub: number): Promise<any[]>;
    findForbiddenWords(idClub: number): Promise<{
        createdAt: Date;
        id: number;
        active: boolean;
        idClub: number;
        word: string;
    }[]>;
    createForbiddenWord(dto: CreateForbiddenWordDto): Promise<{
        createdAt: Date;
        id: number;
        active: boolean;
        idClub: number;
        word: string;
    }>;
    toggleForbiddenWord(id: number, body: {
        active: boolean;
    }): Promise<{
        createdAt: Date;
        id: number;
        active: boolean;
        idClub: number;
        word: string;
    }>;
    removeForbiddenWord(id: number): Promise<{
        message: string;
    }>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateReviewDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
