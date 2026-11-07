import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlatformRuleDto } from './dto/create-platform-rule.dto';
import { UpdatePlatformRuleDto } from './dto/update-platform-rule.dto';
export declare class PlatformRulesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertVersionFree;
    create(dto: CreatePlatformRuleDto): Promise<any>;
    findAll(): Promise<any[]>;
    findActive(): Promise<any[]>;
    findRequiredForSignup(audience: string): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdatePlatformRuleDto): Promise<any>;
    setActive(id: number, active: boolean): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
