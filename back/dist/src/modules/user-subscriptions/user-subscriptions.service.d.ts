import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
export declare class UserSubscriptionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserSubscriptionDto, actingUserId?: number): Promise<any>;
    findAll(): Promise<any[]>;
    findById(id: number): Promise<any>;
    findByUser(userId: number): Promise<any[]>;
    update(id: number, dto: UpdateUserSubscriptionDto, actingUserRole?: string): Promise<any>;
    cancel(id: number, reason?: string): Promise<any>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
}
