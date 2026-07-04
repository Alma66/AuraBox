import { AutoReplyTrigger } from '@prisma/client';
export declare class CreateAutoReplyDto {
    idClub: number;
    name: string;
    triggerType: AutoReplyTrigger;
    triggerValue?: string;
    replyMessage: string;
    active?: boolean;
}
