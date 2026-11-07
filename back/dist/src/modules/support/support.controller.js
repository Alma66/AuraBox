"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const throttler_1 = require("@nestjs/throttler");
const image_upload_1 = require("../../common/utils/image-upload");
const support_service_1 = require("./support.service");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const create_message_dto_1 = require("./dto/create-message.dto");
const create_auto_reply_dto_1 = require("./dto/create-auto-reply.dto");
const update_auto_reply_dto_1 = require("./dto/update-auto-reply.dto");
const request_verification_dto_1 = require("./dto/request-verification.dto");
const confirm_verification_dto_1 = require("./dto/confirm-verification.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/webm',
]);
const attachmentUploadOptions = {
    storage: (0, multer_1.memoryStorage)(),
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(file.mimetype)) {
            callback(new common_1.BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`), false);
            return;
        }
        callback(null, true);
    },
};
let SupportController = class SupportController {
    svc;
    cloudinary;
    constructor(svc, cloudinary) {
        this.svc = svc;
        this.cloudinary = cloudinary;
    }
    async buildAttachments(files) {
        const attachments = [];
        for (const file of files ?? []) {
            const isVideo = file.mimetype.startsWith('video/');
            if (!isVideo) {
                if (file.size > image_upload_1.IMAGE_MAX_BYTES) {
                    throw new common_1.BadRequestException('Las imágenes no pueden superar los 8 MB');
                }
                if (!(0, image_upload_1.hasValidImageSignature)(file.buffer)) {
                    throw new common_1.BadRequestException('El archivo no es una imagen válida');
                }
            }
            const url = isVideo
                ? await this.cloudinary.uploadVideo(file, 'aurabox/support/attachments')
                : await this.cloudinary.uploadImage(file, 'aurabox/support/attachments');
            attachments.push({ url, type: isVideo ? 'Video' : 'Imagen', name: file.originalname });
        }
        return attachments;
    }
    async createConversation(dto, req) {
        return this.svc.createConversation(dto, req.user.id);
    }
    async findByClub(idClub, req, status) {
        return this.svc.findByClub(idClub, req.user, status);
    }
    async findOne(id, req) {
        return this.svc.findOne(id, req.user);
    }
    async getMessages(id, req) {
        return this.svc.getMessages(id, req.user);
    }
    async sendEntrepreneurMessage(dto, req, files) {
        await this.svc.assertCanPost(dto.idConversation, req.user);
        const attachments = await this.buildAttachments(files);
        return this.svc.sendEntrepreneurMessage(dto, req.user, attachments);
    }
    async sendUserMessage(dto, req, files) {
        await this.svc.assertCanPost(dto.idConversation, req.user);
        const attachments = await this.buildAttachments(files);
        return this.svc.sendUserMessage(dto, req.user, attachments);
    }
    async markRead(id, req) {
        return this.svc.markRead(id, req.user);
    }
    async markReadCustomer(id, req) {
        return this.svc.markRead(id, req.user);
    }
    async close(id, req) {
        return this.svc.closeConversation(id, req.user);
    }
    async reopen(id, req) {
        return this.svc.reopenConversation(id, req.user);
    }
    async basicInfo(id, req) {
        return this.svc.getBasicCustomerInfo(id, req.user);
    }
    async requestVerification(dto, req) {
        return this.svc.requestVerification(dto, req.user);
    }
    async confirmVerification(dto, req) {
        return this.svc.confirmVerification(dto, req.user);
    }
    async accessLogs(id, req) {
        return this.svc.getAccessLogs(id, req.user);
    }
    async createAutoReply(dto, req) {
        return this.svc.createAutoReply(dto, req.user);
    }
    async findAutoReplies(idClub, req) {
        return this.svc.findAutoRepliesByClub(idClub, req.user);
    }
    async updateAutoReply(id, dto, req) {
        return this.svc.updateAutoReply(id, dto, req.user);
    }
    async removeAutoReply(id, req) {
        return this.svc.removeAutoReply(id, req.user);
    }
};
exports.SupportController = SupportController;
__decorate([
    (0, roles_decorator_1.Roles)('customer'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, common_1.Post)('conversations'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conversation_dto_1.CreateConversationDto, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "createConversation", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('conversations/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "findByClub", null);
__decorate([
    (0, roles_decorator_1.Roles)('customer', 'entrepreneur', 'admin'),
    (0, common_1.Get)('conversations/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('customer', 'entrepreneur', 'admin'),
    (0, common_1.Get)('conversations/:id/messages'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "getMessages", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur'),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    (0, common_1.Post)('messages/entrepreneur'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, attachmentUploadOptions)),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto, Object, Array]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "sendEntrepreneurMessage", null);
__decorate([
    (0, roles_decorator_1.Roles)('customer'),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    (0, common_1.Post)('messages/user'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, attachmentUploadOptions)),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto, Object, Array]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "sendUserMessage", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Patch)('conversations/:id/read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "markRead", null);
__decorate([
    (0, roles_decorator_1.Roles)('customer'),
    (0, common_1.Patch)('conversations/:id/read/customer'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "markReadCustomer", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Patch)('conversations/:id/close'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "close", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Patch)('conversations/:id/reopen'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "reopen", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('conversations/:id/basic-info'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "basicInfo", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, common_1.Post)('verification/request'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_verification_dto_1.RequestVerificationDto, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "requestVerification", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, common_1.Post)('verification/confirm'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_verification_dto_1.ConfirmVerificationDto, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "confirmVerification", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('conversations/:id/access-logs'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "accessLogs", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Post)('auto-replies'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auto_reply_dto_1.CreateAutoReplyDto, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "createAutoReply", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('auto-replies/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "findAutoReplies", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Put)('auto-replies/:id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_auto_reply_dto_1.UpdateAutoReplyDto, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "updateAutoReply", null);
__decorate([
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Delete)('auto-replies/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "removeAutoReply", null);
exports.SupportController = SupportController = __decorate([
    (0, common_1.Controller)('support'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [support_service_1.SupportService,
        cloudinary_service_1.CloudinaryService])
], SupportController);
//# sourceMappingURL=support.controller.js.map