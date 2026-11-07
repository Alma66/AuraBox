import { SupportService } from './support.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAutoReplyDto } from './dto/create-auto-reply.dto';
import { UpdateAutoReplyDto } from './dto/update-auto-reply.dto';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class SupportController {
    private readonly svc;
    private readonly cloudinary;
    constructor(svc: SupportService, cloudinary: CloudinaryService);
    private buildAttachments;
    createConversation(dto: CreateConversationDto, req: any): Promise<any>;
    findByClub(idClub: number, req: any, status?: 'Abierta' | 'Cerrada'): Promise<any[]>;
    findOne(id: number, req: any): Promise<any>;
    getMessages(id: number, req: any): Promise<any[]>;
    sendEntrepreneurMessage(dto: CreateMessageDto, req: any, files?: Express.Multer.File[]): Promise<any>;
    sendUserMessage(dto: CreateMessageDto, req: any, files?: Express.Multer.File[]): Promise<any>;
    markRead(id: number, req: any): Promise<any>;
    markReadCustomer(id: number, req: any): Promise<any>;
    close(id: number, req: any): Promise<any>;
    reopen(id: number, req: any): Promise<any>;
    basicInfo(id: number, req: any): Promise<{
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
        channel: "Email";
        expiresAt: string;
        sent: boolean;
    }>;
    confirmVerification(dto: ConfirmVerificationDto, req: any): Promise<{
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
    accessLogs(id: number, req: any): Promise<any[]>;
    createAutoReply(dto: CreateAutoReplyDto, req: any): Promise<{
        id: number;
        name: string;
        idClub: number;
        active: boolean;
        createdAt: Date;
        triggerType: import("@prisma/client").$Enums.AutoReplyTrigger;
        triggerValue: string | null;
        replyMessage: string;
    }>;
    findAutoReplies(idClub: number, req: any): Promise<{
        id: number;
        name: string;
        idClub: number;
        active: boolean;
        createdAt: Date;
        triggerType: import("@prisma/client").$Enums.AutoReplyTrigger;
        triggerValue: string | null;
        replyMessage: string;
    }[]>;
    updateAutoReply(id: number, dto: UpdateAutoReplyDto, req: any): Promise<{
        id: number;
        name: string;
        idClub: number;
        active: boolean;
        createdAt: Date;
        triggerType: import("@prisma/client").$Enums.AutoReplyTrigger;
        triggerValue: string | null;
        replyMessage: string;
    }>;
    removeAutoReply(id: number, req: any): Promise<{
        message: string;
    }>;
}
