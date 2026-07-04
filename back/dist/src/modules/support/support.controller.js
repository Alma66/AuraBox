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
const support_service_1 = require("./support.service");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const create_message_dto_1 = require("./dto/create-message.dto");
const create_auto_reply_dto_1 = require("./dto/create-auto-reply.dto");
const request_verification_dto_1 = require("./dto/request-verification.dto");
const confirm_verification_dto_1 = require("./dto/confirm-verification.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let SupportController = class SupportController {
    svc;
    cloudinary;
    constructor(svc, cloudinary) {
        this.svc = svc;
        this.cloudinary = cloudinary;
    }
    async createConversation(dto) {
        return this.svc.createConversation(dto);
    }
    async findByClub(idClub, status) {
        return this.svc.findByClub(idClub, status);
    }
    async findOne(id) {
        return this.svc.findOne(id);
    }
    async getMessages(id) {
        return this.svc.getMessages(id);
    }
    async sendEntrepreneurMessage(dto, files) {
        const attachments = [];
        for (const file of files ?? []) {
            const type = file.mimetype.startsWith('video') ? 'Video' : 'Imagen';
            const url = await this.cloudinary.uploadImage(file, 'aurabox/support/attachments');
            attachments.push({ url, type, name: file.originalname });
        }
        return this.svc.sendEntrepreneurMessage(dto, attachments);
    }
    async sendUserMessage(dto, files) {
        const attachments = [];
        for (const file of files ?? []) {
            const type = file.mimetype.startsWith('video') ? 'Video' : 'Imagen';
            const url = await this.cloudinary.uploadImage(file, 'aurabox/support/attachments');
            attachments.push({ url, type, name: file.originalname });
        }
        return this.svc.sendUserMessage(dto, attachments);
    }
    async markRead(id) {
        return this.svc.markRead(id, 'entrepreneur');
    }
    async close(id) {
        return this.svc.closeConversation(id);
    }
    async reopen(id) {
        return this.svc.reopenConversation(id);
    }
    async basicInfo(id) {
        return this.svc.getBasicCustomerInfo(id);
    }
    async requestVerification(dto, req) {
        return this.svc.requestVerification(dto, req.user?.id);
    }
    async confirmVerification(dto, req) {
        return this.svc.confirmVerification(dto, req.user?.id);
    }
    async accessLogs(id) {
        return this.svc.getAccessLogs(id);
    }
    async createAutoReply(dto) {
        return this.svc.createAutoReply(dto);
    }
    async findAutoReplies(idClub) {
        return this.svc.findAutoRepliesByClub(idClub);
    }
    async updateAutoReply(id, dto) {
        return this.svc.updateAutoReply(id, dto);
    }
    async removeAutoReply(id) {
        return this.svc.removeAutoReply(id);
    }
};
exports.SupportController = SupportController;
__decorate([
    (0, common_1.Post)('conversations'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "createConversation", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('conversations/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "findByClub", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "getMessages", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Post)('messages/entrepreneur'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, { storage: (0, multer_1.memoryStorage)(), limits: { fileSize: 20 * 1024 * 1024 } })),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto, Array]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "sendEntrepreneurMessage", null);
__decorate([
    (0, common_1.Post)('messages/user'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, { storage: (0, multer_1.memoryStorage)(), limits: { fileSize: 20 * 1024 * 1024 } })),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto, Array]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "sendUserMessage", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Patch)('conversations/:id/read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "markRead", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Patch)('conversations/:id/close'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "close", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Patch)('conversations/:id/reopen'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "reopen", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('conversations/:id/basic-info'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "basicInfo", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Post)('verification/request'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_verification_dto_1.RequestVerificationDto, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "requestVerification", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Post)('verification/confirm'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_verification_dto_1.ConfirmVerificationDto, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "confirmVerification", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('conversations/:id/access-logs'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "accessLogs", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Post)('auto-replies'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auto_reply_dto_1.CreateAutoReplyDto]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "createAutoReply", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Get)('auto-replies/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "findAutoReplies", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Put)('auto-replies/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "updateAutoReply", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    (0, common_1.Delete)('auto-replies/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "removeAutoReply", null);
exports.SupportController = SupportController = __decorate([
    (0, common_1.Controller)('support'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [support_service_1.SupportService,
        cloudinary_service_1.CloudinaryService])
], SupportController);
//# sourceMappingURL=support.controller.js.map