import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
type RequestUser = {
    id: number;
    role: string;
};
export declare class PromotionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertClubAccess;
    create(dto: CreatePromotionDto, user: RequestUser): Promise<any>;
    findByClub(idClub: number, user: RequestUser): Promise<any[]>;
    findOne(id: number, user: RequestUser): Promise<any>;
    update(id: number, dto: UpdatePromotionDto, user: RequestUser): Promise<any>;
    toggleActive(id: number, active: boolean, user: RequestUser): Promise<any>;
    remove(id: number, user: RequestUser): Promise<{
        message: string;
    }>;
}
export {};
