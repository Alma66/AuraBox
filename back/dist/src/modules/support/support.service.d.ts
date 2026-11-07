import { PrismaService } from '../../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAutoReplyDto } from './dto/create-auto-reply.dto';
import { UpdateAutoReplyDto } from './dto/update-auto-reply.dto';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { MailerService } from '../mailer/mailer.service';
type RequestUser = {
    id: number;
    role: string;
};
type AttachmentData = {
    url: string;
    type: 'Imagen' | 'Video';
    name?: string;
};
export declare class SupportService {
    private readonly prisma;
    private readonly mailer;
    constructor(prisma: PrismaService, mailer: MailerService);
    private assertClubAccess;
    private assertConversationAccess;
    private assertEntrepreneur;
    assertCanPost(idConversation: number, user: RequestUser): Promise<{
        id: number;
        status: import("@prisma/client").$Enums.ConversationStatus;
        idClub: number;
        idUser: number;
        createdAt: Date;
        idSubscriptionTypes: number;
        subject: string;
        closedAt: Date | null;
        lastMessageAt: Date;
        hasUnreadForEntrepreneur: boolean;
        hasUnreadForUser: boolean;
    }>;
    createConversation(dto: CreateConversationDto, idUser: number): Promise<any>;
    private handleAutoReply;
    findByClub(idClub: number, user: RequestUser, status?: 'Abierta' | 'Cerrada'): Promise<any[]>;
    findOne(id: number, user: RequestUser): Promise<any>;
    getMessages(idConversation: number, user: RequestUser): Promise<any[]>;
    sendEntrepreneurMessage(dto: CreateMessageDto, user: RequestUser, attachmentUrls?: AttachmentData[]): Promise<any>;
    sendUserMessage(dto: CreateMessageDto, user: RequestUser, attachmentUrls?: AttachmentData[]): Promise<any>;
    markRead(idConversation: number, user: RequestUser): Promise<any>;
    closeConversation(idConversation: number, user: RequestUser): Promise<any>;
    reopenConversation(idConversation: number, user: RequestUser): Promise<any>;
    getBasicCustomerInfo(idConversation: number, user: RequestUser): Promise<{
        subscriptionName: string;
        startDate: string;
        paymentMethodType: string;
        shipmentStatus: string;
        courier: string | null;
        rider: string | null;
        province: string | null;
        locality: string | null;
    }[]>;
    requestVerification(dto: RequestVerificationDto, user: RequestUser): Promise<{
        channel: "Email";
        expiresAt: string;
        sent: boolean;
    }>;
    confirmVerification(dto: ConfirmVerificationDto, user: RequestUser): Promise<{
        dni: number;
        phoneNumber: string | null;
        streetAddress: string | null;
        addressNumber: number | null;
        floorNumber: string | null;
        addressDetails: string | null;
        postalCode: string | null;
        city: string | null;
        trackingNumbers: (string | null)[];
    }>;
    getAccessLogs(idConversation: number, user: RequestUser): Promise<any[]>;
    createAutoReply(dto: CreateAutoReplyDto, user: RequestUser): Promise<{
        id: number;
        name: string;
        idClub: number;
        active: boolean;
        createdAt: Date;
        triggerType: import("@prisma/client").$Enums.AutoReplyTrigger;
        triggerValue: string | null;
        replyMessage: string;
    }>;
    findAutoRepliesByClub(idClub: number, user: RequestUser): Promise<{
        id: number;
        name: string;
        idClub: number;
        active: boolean;
        createdAt: Date;
        triggerType: import("@prisma/client").$Enums.AutoReplyTrigger;
        triggerValue: string | null;
        replyMessage: string;
    }[]>;
    updateAutoReply(id: number, dto: UpdateAutoReplyDto, user: RequestUser): Promise<{
        id: number;
        name: string;
        idClub: number;
        active: boolean;
        createdAt: Date;
        triggerType: import("@prisma/client").$Enums.AutoReplyTrigger;
        triggerValue: string | null;
        replyMessage: string;
    }>;
    removeAutoReply(id: number, user: RequestUser): Promise<{
        message: string;
    }>;
}
export {};
