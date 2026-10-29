import {
  Body, Controller, Get, Param, ParseIntPipe, Patch,
  Query, Request, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminPanelService } from './admin-panel.service';
import { ChangeClubStatusDto } from './dto/change-club-status.dto';
import { SetActiveDto } from './dto/set-active.dto';
import { SetReviewVisibilityDto } from './dto/set-review-visibility.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminPanelController {
  constructor(private readonly service: AdminPanelService) {}

  @Get('stats')
  async getStats() {
    return this.service.getStats();
  }

  @Get('clubs')
  async findClubs(@Query('status') status?: string) {
    return this.service.findClubs(status);
  }

  @Get('clubs/:id/status-history')
  async findClubStatusHistory(@Param('id', ParseIntPipe) id: number) {
    return this.service.findClubStatusHistory(id);
  }

  @Patch('clubs/:id/status')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async changeClubStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeClubStatusDto,
    @Request() req: any,
  ) {
    return this.service.changeClubStatus(id, req.user.id, dto);
  }

  @Get('accounts')
  async findAccounts(@Query('type') type: string, @Query('search') search?: string) {
    return this.service.findAccounts(type, search);
  }

  @Patch('accounts/:type/:id/active')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async setAccountActive(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetActiveDto,
  ) {
    return this.service.setAccountActive(type, id, dto.active);
  }

  @Get('reviews')
  async findReviews(@Query('filter') filter?: string) {
    return this.service.findReviews(filter);
  }

  @Patch('reviews/:id/visibility')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async setReviewVisibility(@Param('id', ParseIntPipe) id: number, @Body() dto: SetReviewVisibilityDto) {
    return this.service.setReviewVisibility(id, dto);
  }
}