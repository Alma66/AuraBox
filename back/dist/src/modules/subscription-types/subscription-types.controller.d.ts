import { SubscriptionTypesService } from './subscription-types.service';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-types.dto';
import { UpdateSubscriptionTypeDto } from './dto/update-subscription-types.dto';
export declare class SubscriptionTypesController {
    private readonly svc;
    constructor(svc: SubscriptionTypesService);
    findAll(clubId?: string): Promise<any[]>;
    findOne(id: number): Promise<any>;
    create(dto: CreateSubscriptionTypeDto, req: any): Promise<any>;
    update(id: number, dto: UpdateSubscriptionTypeDto, req: any): Promise<any>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
}
