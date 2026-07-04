import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateForbiddenWordDto } from './dto/create-forbidden-word.dto';
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateReviewDto): Promise<any>;
    private matchesForbiddenWord;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByUser(idUser: number): Promise<any[]>;
    findByClub(idClub: number, includeHidden?: boolean): Promise<any[]>;
    findHiddenByClub(idClub: number): Promise<any[]>;
    update(id: number, dto: UpdateReviewDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
    createForbiddenWord(dto: CreateForbiddenWordDto): Promise<{
        createdAt: Date;
        id: number;
        active: boolean;
        idClub: number;
        word: string;
    }>;
    findForbiddenWordsByClub(idClub: number): Promise<{
        createdAt: Date;
        id: number;
        active: boolean;
        idClub: number;
        word: string;
    }[]>;
    removeForbiddenWord(id: number): Promise<{
        message: string;
    }>;
    toggleForbiddenWord(id: number, active: boolean): Promise<{
        createdAt: Date;
        id: number;
        active: boolean;
        idClub: number;
        word: string;
    }>;
}
