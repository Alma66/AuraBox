import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateForbiddenWordDto } from './dto/create-forbidden-word.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(dto: CreateReviewDto, req: any): Promise<any>;
    checkEligibility(idSubscriptionTypes: number, req: any): Promise<{
        eligible: boolean;
        alreadyReviewed: boolean;
        hasEligibleSubscription: boolean;
    }>;
    addMedia(id: number, files: Express.Multer.File[], req: any): Promise<any>;
    removeMedia(id: number, mediaId: number, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findByUser(idUser: number, req: any): Promise<any[]>;
    findBySubscriptionType(id: number, req: any, limit?: string, offset?: string): Promise<{
        reviews: any[];
        total: number;
    }>;
    getSummaryByClub(idClub: number, req: any): Promise<{
        average: number;
        count: number;
    }>;
    getSummaryBySubscriptionType(id: number, req: any): Promise<{
        average: number;
        count: number;
    }>;
    findByClub(idClub: number, includeHidden: string | undefined, req: any): Promise<any[]>;
    findHiddenByClub(idClub: number, req: any): Promise<any[]>;
    findForbiddenWords(idClub: number, req: any): Promise<{
        id: number;
        idClub: number;
        active: boolean;
        createdAt: Date;
        word: string;
    }[]>;
    createForbiddenWord(dto: CreateForbiddenWordDto, req: any): Promise<{
        id: number;
        idClub: number;
        active: boolean;
        createdAt: Date;
        word: string;
    }>;
    toggleForbiddenWord(id: number, body: {
        active: boolean;
    }, req: any): Promise<{
        id: number;
        idClub: number;
        active: boolean;
        createdAt: Date;
        word: string;
    }>;
    removeForbiddenWord(id: number, req: any): Promise<{
        message: string;
    }>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdateReviewDto, req: any): Promise<any>;
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
}
