import { Controller, Get, Param, ParseIntPipe, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@Request() req, @Query('limit') limit?: string) {
    return this.notificationsService.listForUser(req.user.id, limit ? Number(limit) : undefined);
  }

  @Get('unread-count')
  async unreadCount(@Request() req) {
    return this.notificationsService.unreadCount(req.user.id);
  }

  @Get('upcoming-renewals')
  async upcomingRenewals(@Request() req) {
    return this.notificationsService.upcomingRenewals(req.user.id);
  }

  @Patch('read-all')
  async markAllRead(@Request() req) {
    return this.notificationsService.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  async markRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.notificationsService.markRead(req.user.id, id);
  }
}