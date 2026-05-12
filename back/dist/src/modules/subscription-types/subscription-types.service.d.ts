import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-types.dto';
import { UpdateSubscriptionTypeDto } from './dto/update-subscription-types.dto';
export declare class SubscriptionTypesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateSubscriptionTypeDto): Promise<any>;
    findAll(): Promise<any[]>;
    findById(id: number): Promise<any>;
    findByClub(idClub: number): Promise<any[]>;
    update(id: number, dto: UpdateSubscriptionTypeDto, userRole?: string): Promise<any>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
}
