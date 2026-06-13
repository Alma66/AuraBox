import { BoxContentHistoryService } from './box-content-history.service';
import { CreateBoxContentHistoryDto } from './dto/create-box-content-history.dto';
import { UpdateBoxContentHistoryDto } from './dto/update-box-content-history.dto';
export declare class BoxContentHistoryController {
    private readonly svc;
    constructor(svc: BoxContentHistoryService);
    create(dto: CreateBoxContentHistoryDto, req: any, image?: Express.Multer.File): Promise<any>;
    findAll(page?: string, perPage?: string): Promise<any[]>;
    findBySubscriptionType(idSubscriptionTypes: number): Promise<any[]>;
    findByDeliveryMonth(deliveryMonthYear: string): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateBoxContentHistoryDto, req: any): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
