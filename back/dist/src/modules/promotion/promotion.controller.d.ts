import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
export declare class PromotionController {
    private readonly svc;
    constructor(svc: PromotionService);
    create(dto: CreatePromotionDto, req: any): Promise<any>;
    findByClub(idClub: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdatePromotionDto): Promise<any>;
    toggle(id: number, body: {
        active: boolean;
    }): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
