import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Put, UseGuards, Request, UsePipes, ValidationPipe,
  Query, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SupportService } from './support.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAutoReplyDto } from './dto/create-auto-reply.dto';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

interface AttachmentInput {
  url: string;
  type: 'Imagen' | 'Video';
  name?: string;
}

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(
    private readonly svc: SupportService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Post('conversations')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createConversation(@Body() dto: CreateConversationDto) {
    return this.svc.createConversation(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('conversations/by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number, @Query('status') status?: 'Abierta' | 'Cerrada') {
    return this.svc.findByClub(idClub, status);
  }

  @Get('conversations/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getMessages(id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post('messages/entrepreneur')
  @UseInterceptors(FilesInterceptor('files', 5, { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async sendEntrepreneurMessage(@Body() dto: CreateMessageDto, @UploadedFiles() files?: Express.Multer.File[]) {
    const attachments: AttachmentInput[] = [];
    for (const file of files ?? []) {
      const type: 'Imagen' | 'Video' = file.mimetype.startsWith('video') ? 'Video' : 'Imagen';
      const url = await this.cloudinary.uploadImage(file, 'aurabox/support/attachments');
      attachments.push({ url, type, name: file.originalname });
    }
    return this.svc.sendEntrepreneurMessage(dto, attachments);
  }

  @Post('messages/user')
  @UseInterceptors(FilesInterceptor('files', 5, { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async sendUserMessage(@Body() dto: CreateMessageDto, @UploadedFiles() files?: Express.Multer.File[]) {
    const attachments: AttachmentInput[] = [];
    for (const file of files ?? []) {
      const type: 'Imagen' | 'Video' = file.mimetype.startsWith('video') ? 'Video' : 'Imagen';
      const url = await this.cloudinary.uploadImage(file, 'aurabox/support/attachments');
      attachments.push({ url, type, name: file.originalname });
    }
    return this.svc.sendUserMessage(dto, attachments);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Patch('conversations/:id/read')
  async markRead(@Param('id', ParseIntPipe) id: number) {
    return this.svc.markRead(id, 'entrepreneur');
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Patch('conversations/:id/close')
  async close(@Param('id', ParseIntPipe) id: number) {
    return this.svc.closeConversation(id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Patch('conversations/:id/reopen')
  async reopen(@Param('id', ParseIntPipe) id: number) {
    return this.svc.reopenConversation(id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('conversations/:id/basic-info')
  async basicInfo(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getBasicCustomerInfo(id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post('verification/request')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async requestVerification(@Body() dto: RequestVerificationDto, @Request() req) {
    return this.svc.requestVerification(dto, req.user?.id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post('verification/confirm')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async confirmVerification(@Body() dto: ConfirmVerificationDto, @Request() req) {
    return this.svc.confirmVerification(dto, req.user?.id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('conversations/:id/access-logs')
  async accessLogs(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getAccessLogs(id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post('auto-replies')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createAutoReply(@Body() dto: CreateAutoReplyDto) {
    return this.svc.createAutoReply(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('auto-replies/by-club/:idClub')
  async findAutoReplies(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.svc.findAutoRepliesByClub(idClub);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put('auto-replies/:id')
  async updateAutoReply(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateAutoReplyDto>) {
    return this.svc.updateAutoReply(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Delete('auto-replies/:id')
  async removeAutoReply(@Param('id', ParseIntPipe) id: number) {
    return this.svc.removeAutoReply(id);
  }
}