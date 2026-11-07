import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
type RequestUser = {
    id: number;
    role: string;
};
export declare class UserSubscriptionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertEntrepreneurOwnsSubscription;
    create(dto: CreateUserSubscriptionDto, actingUser: RequestUser): Promise<any>;
    findAll(): Promise<any[]>;
    findById(id: number): Promise<any>;
    findOneForRequester(id: number, user: RequestUser): Promise<any>;
    findByUser(userId: number): Promise<any[]>;
    updateForRequester(id: number, dto: UpdateUserSubscriptionDto, user: RequestUser): Promise<any>;
    update(id: number, dto: UpdateUserSubscriptionDto): Promise<any>;
    cancel(id: number, reason?: unknown): Promise<any>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
}
export {};
