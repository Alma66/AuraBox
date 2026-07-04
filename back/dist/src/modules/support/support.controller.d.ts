import { SupportService } from './support.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAutoReplyDto } from './dto/create-auto-reply.dto';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class SupportController {
    private readonly svc;
    private readonly cloudinary;
    constructor(svc: SupportService, cloudinary: CloudinaryService);
    createConversation(dto: CreateConversationDto): Promise<any>;
    findByClub(idClub: number, status?: 'Abierta' | 'Cerrada'): Promise<any[]>;
    findOne(id: number): Promise<any>;
    getMessages(id: number): Promise<any[]>;
    sendEntrepreneurMessage(dto: CreateMessageDto, files?: Express.Multer.File[]): Promise<any>;
    sendUserMessage(dto: CreateMessageDto, files?: Express.Multer.File[]): Promise<any>;
    markRead(id: number): Promise<{
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
    close(id: number): Promise<{
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
    reopen(id: number): Promise<{
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
    basicInfo(id: number): Promise<{
        subscriptionName: string;
        startDate: string;
        paymentMethodType: string;
        shipmentStatus: string;
        courier: string | null;
        rider: string | null;
        province: string | null;
        locality: string | null;
    }[]>;
    requestVerification(dto: RequestVerificationDto, req: any): Promise<{
        code: string;
        channel: import("@prisma/client").$Enums.VerificationChannel;
        expiresAt: string;
    }>;
    confirmVerification(dto: ConfirmVerificationDto, req: any): Promise<{
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
    accessLogs(id: number): Promise<any[]>;
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
    findAutoReplies(idClub: number): Promise<{
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
