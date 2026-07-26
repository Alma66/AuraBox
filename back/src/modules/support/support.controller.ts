import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Put, UseGuards, Request, UsePipes, ValidationPipe,
  Query, UseInterceptors, UploadedFiles, BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Throttle } from '@nestjs/throttler';
import { SupportService } from './support.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAutoReplyDto } from './dto/create-auto-reply.dto';
import { UpdateAutoReplyDto } from './dto/update-auto-reply.dto';
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

const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
]);

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(
    private readonly svc: SupportService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private async buildAttachments(files?: Express.Multer.File[]): Promise<AttachmentInput[]> {
    const attachments: AttachmentInput[] = [];
    for (const file of files ?? []) {
      if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(file.mimetype)) {
        throw new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`);
      }
      const type: 'Imagen' | 'Video' = file.mimetype.startsWith('video/') ? 'Video' : 'Imagen';
      const url = await this.cloudinary.uploadImage(file, 'aurabox/support/attachments');
      attachments.push({ url, type, name: file.originalname });
    }
    return attachments;
  }

  @UseGuards(RolesGuard)
  @Roles('customer')
  @Post('conversations')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createConversation(@Body() dto: CreateConversationDto, @Request() req) {
    return this.svc.createConversation(dto, req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('conversations/by-club/:idClub')
  async findByClub(
    @Param('idClub', ParseIntPipe) idClub: number,
    @Request() req,
    @Query('status') status?: 'Abierta' | 'Cerrada',
  ) {
    return this.svc.findByClub(idClub, req.user, status);
  }

  @Get('conversations/:id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.findOne(id, req.user);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.getMessages(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post('messages/entrepreneur')
  @UseInterceptors(FilesInterceptor('files', 5, { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async sendEntrepreneurMessage(
    @Body() dto: CreateMessageDto,
    @Request() req,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const attachments = await this.buildAttachments(files);
    return this.svc.sendEntrepreneurMessage(dto, req.user, attachments);
  }

  @UseGuards(RolesGuard)
  @Roles('customer')
  @Post('messages/user')
  @UseInterceptors(FilesInterceptor('files', 5, { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async sendUserMessage(
    @Body() dto: CreateMessageDto,
    @Request() req,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const attachments = await this.buildAttachments(files);
    return this.svc.sendUserMessage(dto, req.user, attachments);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Patch('conversations/:id/read')
  async markRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.markRead(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('customer')
  @Patch('conversations/:id/read/customer')
  async markReadCustomer(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.markRead(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Patch('conversations/:id/close')
  async close(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.closeConversation(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Patch('conversations/:id/reopen')
  async reopen(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.reopenConversation(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('conversations/:id/basic-info')
  async basicInfo(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.getBasicCustomerInfo(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('verification/request')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async requestVerification(@Body() dto: RequestVerificationDto, @Request() req) {
    return this.svc.requestVerification(dto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verification/confirm')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async confirmVerification(@Body() dto: ConfirmVerificationDto, @Request() req) {
    return this.svc.confirmVerification(dto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('conversations/:id/access-logs')
  async accessLogs(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.getAccessLogs(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post('auto-replies')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createAutoReply(@Body() dto: CreateAutoReplyDto, @Request() req) {
    return this.svc.createAutoReply(dto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('auto-replies/by-club/:idClub')
  async findAutoReplies(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    return this.svc.findAutoRepliesByClub(idClub, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put('auto-replies/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateAutoReply(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAutoReplyDto, @Request() req) {
    return this.svc.updateAutoReply(id, dto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Delete('auto-replies/:id')
  async removeAutoReply(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.removeAutoReply(id, req.user);
  }
}