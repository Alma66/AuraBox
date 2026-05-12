import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlatformRuleDto } from './dto/create-platform-rule.dto';
import { UpdatePlatformRuleDto } from './dto/update-platform-rule.dto';
export declare class PlatformRulesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreatePlatformRuleDto): Promise<any>;
    findAll(): Promise<any[]>;
    findActive(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdatePlatformRuleDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
