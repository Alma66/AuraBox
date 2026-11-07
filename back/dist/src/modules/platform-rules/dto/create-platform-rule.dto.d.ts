import { RuleAcceptanceScope } from '@prisma/client';
export declare class CreatePlatformRuleDto {
    title: string;
    content: string;
    version: string;
    ruleType: string;
    acceptanceScope?: RuleAcceptanceScope;
}
