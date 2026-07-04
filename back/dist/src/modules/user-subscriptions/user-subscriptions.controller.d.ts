import { UserSubscriptionsService } from './user-subscriptions.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
export declare class UserSubscriptionsController {
    private readonly svc;
    constructor(svc: UserSubscriptionsService);
    create(dto: CreateUserSubscriptionDto, req: any): Promise<any>;
    findAll(userId?: string): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateUserSubscriptionDto, req: any): Promise<any>;
    cancel(id: number, body: {
        reason?: string;
    }, req: any): Promise<any>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
}
