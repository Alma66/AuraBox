import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
export declare class PromotionController {
    private readonly svc;
    constructor(svc: PromotionService);
    create(dto: CreatePromotionDto, req: any): Promise<any>;
    findByClub(idClub: number, req: any): Promise<any[]>;
    findOne(id: number, req: any): Promise<any>;
    update(id: number, dto: UpdatePromotionDto, req: any): Promise<any>;
    toggle(id: number, body: {
        active: boolean;
    }, req: any): Promise<any>;
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
}
