import { AutoReplyTrigger } from '@prisma/client';
export declare class UpdateAutoReplyDto {
    name?: string;
    triggerType?: AutoReplyTrigger;
    triggerValue?: string;
    replyMessage?: string;
    active?: boolean;
}
