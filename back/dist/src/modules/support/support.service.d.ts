import { PrismaService } from '../../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAutoReplyDto } from './dto/create-auto-reply.dto';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
export declare class SupportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createConversation(dto: CreateConversationDto): Promise<any>;
    private handleAutoReply;
    findByClub(idClub: number, status?: 'Abierta' | 'Cerrada'): Promise<any[]>;
    findOne(id: number): Promise<any>;
    getMessages(idConversation: number): Promise<any[]>;
    sendEntrepreneurMessage(dto: CreateMessageDto, attachmentUrls?: {
        url: string;
        type: 'Imagen' | 'Video';
        name?: string;
    }[]): Promise<any>;
    sendUserMessage(dto: CreateMessageDto, attachmentUrls?: {
        url: string;
        type: 'Imagen' | 'Video';
        name?: string;
    }[]): Promise<any>;
    markRead(idConversation: number, by: 'entrepreneur' | 'user'): Promise<{
        createdAt: Date;
        id: number;
        idClub: number;
        idSubscriptionTypes: number;
        idUser: number;
        status: import("@prisma/client").$Enums.ConversationStatus;
        subject: string;
        closedAt: Date | null;
        lastMessageAt: Date;
        hasUnreadForEntrepreneur: boolean;
        hasUnreadForUser: boolean;
    }>;
    closeConversation(idConversation: number): Promise<{
        createdAt: Date;
        id: number;
        idClub: number;
        idSubscriptionTypes: number;
        idUser: number;
        status: import("@prisma/client").$Enums.ConversationStatus;
        subject: string;
        closedAt: Date | null;
        lastMessageAt: Date;
        hasUnreadForEntrepreneur: boolean;
        hasUnreadForUser: boolean;
    }>;
    reopenConversation(idConversation: number): Promise<{
        createdAt: Date;
        id: number;
        idClub: number;
        idSubscriptionTypes: number;
        idUser: number;
        status: import("@prisma/client").$Enums.ConversationStatus;
        subject: string;
        closedAt: Date | null;
        lastMessageAt: Date;
        hasUnreadForEntrepreneur: boolean;
        hasUnreadForUser: boolean;
    }>;
    getBasicCustomerInfo(idConversation: number): Promise<{
        subscriptionName: string;
        startDate: string;
        paymentMethodType: string;
        shipmentStatus: string;
        courier: string | null;
        rider: string | null;
        province: string | null;
        locality: string | null;
    }[]>;
    requestVerification(dto: RequestVerificationDto, createdBy?: number): Promise<{
        code: string;
        channel: import("@prisma/client").$Enums.VerificationChannel;
        expiresAt: string;
    }>;
    confirmVerification(dto: ConfirmVerificationDto, entrepreneurId?: number): Promise<{
        dni: number;
        phoneNumber: number | null;
        streetAddress: string | null;
        addressNumber: number | null;
        floorNumber: string | null;
        addressDetails: string | null;
        postalCode: string | null;
        city: string | null;
        lastCardDigits: (string | null)[];
    }>;
    getAccessLogs(idConversation: number): Promise<any[]>;
    createAutoReply(dto: CreateAutoReplyDto): Promise<{
        name: string;
        createdAt: Date;
        id: number;
        active: boolean;
        idClub: number;
        triggerType: import("@prisma/client").$Enums.AutoReplyTrigger;
        triggerValue: string | null;
        replyMessage: string;
    }>;
    findAutoRepliesByClub(idClub: number): Promise<{
        name: string;
        createdAt: Date;
        id: number;
        active: boolean;
        idClub: number;
        triggerType: import("@prisma/client").$Enums.AutoReplyTrigger;
        triggerValue: string | null;
        replyMessage: string;
    }[]>;
    updateAutoReply(id: number, dto: Partial<CreateAutoReplyDto>): Promise<{
        name: string;
        createdAt: Date;
        id: number;
        active: boolean;
        idClub: number;
        triggerType: import("@prisma/client").$Enums.AutoReplyTrigger;
        triggerValue: string | null;
        replyMessage: string;
    }>;
    removeAutoReply(id: number): Promise<{
        message: string;
    }>;
}
