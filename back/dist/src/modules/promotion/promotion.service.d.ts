import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
export declare class PromotionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreatePromotionDto, createdBy?: number): Promise<any>;
    findByClub(idClub: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdatePromotionDto): Promise<any>;
    toggleActive(id: number, active: boolean): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
