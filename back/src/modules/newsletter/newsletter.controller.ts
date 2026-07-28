import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('newsletter')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('entrepreneur', 'admin')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('send')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async send(@Body() dto: CreateNewsletterDto, @Request() req: any) {
    return this.newsletterService.send(dto, req.user);
  }

  @Get('history/:idClub')
  async findHistory(@Param('idClub', ParseIntPipe) idClub: number, @Request() req: any) {
    return this.newsletterService.findHistoryByClub(idClub, req.user);
  }
}