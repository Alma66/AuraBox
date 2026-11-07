import { PlatformRulesService } from './platform-rules.service';
import { CreatePlatformRuleDto } from './dto/create-platform-rule.dto';
import { UpdatePlatformRuleDto } from './dto/update-platform-rule.dto';
import { SetRuleActiveDto } from './dto/set-rule-active.dto';
export declare class PlatformRulesController {
    private readonly svc;
    constructor(svc: PlatformRulesService);
    findActive(): Promise<any[]>;
    findRequiredForSignup(audience: string): Promise<any[]>;
    create(dto: CreatePlatformRuleDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdatePlatformRuleDto): Promise<any>;
    setActive(id: number, dto: SetRuleActiveDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
