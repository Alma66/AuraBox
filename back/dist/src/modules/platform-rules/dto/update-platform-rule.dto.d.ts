import { RuleAcceptanceScope } from '@prisma/client';
export declare class UpdatePlatformRuleDto {
    title?: string;
    content?: string;
    version?: string;
    ruleType?: string;
    acceptanceScope?: RuleAcceptanceScope;
}
