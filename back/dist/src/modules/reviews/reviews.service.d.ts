import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateForbiddenWordDto } from './dto/create-forbidden-word.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { OptionalRequestUser } from '../../common/utils/club-visibility';
type RequestUser = {
    id: number;
    role: string;
};
export declare class ReviewsService {
    private readonly prisma;
    private readonly cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    assertClubAccess(idClub: number, user: RequestUser): Promise<void>;
    private matchesForbiddenWord;
    private attachCustomerNames;
    checkEligibility(idUser: number, idSubscriptionTypes: number): Promise<{
        eligible: boolean;
        alreadyReviewed: boolean;
        hasEligibleSubscription: boolean;
    }>;
    create(dto: CreateReviewDto, idUser: number): Promise<any>;
    addMedia(reviewId: number, files: Express.Multer.File[], requesterId: number): Promise<any>;
    removeMedia(reviewId: number, mediaId: number, requesterId: number): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findOneForRequester(id: number, user: RequestUser): Promise<any>;
    findByUser(idUser: number): Promise<any[]>;
    findByClub(idClub: number, includeHidden?: boolean): Promise<any[]>;
    findBySubscriptionType(idSubscriptionTypes: number, user: OptionalRequestUser, limit?: number, offset?: number): Promise<{
        reviews: any[];
        total: number;
    }>;
    findHiddenByClub(idClub: number): Promise<any[]>;
    getSummaryByClub(idClub: number, user: OptionalRequestUser): Promise<{
        average: number;
        count: number;
    }>;
    getSummaryBySubscriptionType(idSubscriptionTypes: number, user: OptionalRequestUser): Promise<{
        average: number;
        count: number;
    }>;
    updateForRequester(id: number, dto: UpdateReviewDto, user: RequestUser): Promise<any>;
    update(id: number, dto: Partial<UpdateReviewDto>): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
    createForbiddenWord(dto: CreateForbiddenWordDto): Promise<{
        id: number;
        idClub: number;
        active: boolean;
        createdAt: Date;
        word: string;
    }>;
    findForbiddenWordsByClub(idClub: number): Promise<{
        id: number;
        idClub: number;
        active: boolean;
        createdAt: Date;
        word: string;
    }[]>;
    removeForbiddenWord(id: number, user: RequestUser): Promise<{
        message: string;
    }>;
    toggleForbiddenWord(id: number, active: boolean, user: RequestUser): Promise<{
        id: number;
        idClub: number;
        active: boolean;
        createdAt: Date;
        word: string;
    }>;
}
export {};
