import { PlatformRulesService } from './platform-rules.service';
import { CreatePlatformRuleDto } from './dto/create-platform-rule.dto';
import { UpdatePlatformRuleDto } from './dto/update-platform-rule.dto';
export declare class PlatformRulesController {
    private readonly svc;
    constructor(svc: PlatformRulesService);
    create(dto: CreatePlatformRuleDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findActive(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdatePlatformRuleDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
