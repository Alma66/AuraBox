import { Controller, ForbiddenException, Get, Param, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('entrepreneur', 'admin')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly prisma: PrismaService,
  ) {}

  private async assertClubAccess(idClub: number, user: { id: number; role: string }) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  @Get('club-stats/:idClub')
  async getClubStats(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    await this.assertClubAccess(idClub, req.user);
    return this.analyticsService.getClubStats(idClub);
  }

  @Get('sales-report/:idClub')
  async getSalesReport(
    @Param('idClub', ParseIntPipe) idClub: number,
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('idSubscriptionTypes') idSubscriptionTypes?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('idPaymentMethods') idPaymentMethods?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    await this.assertClubAccess(idClub, req.user);
    return this.analyticsService.getSalesReport(idClub, {
      from,
      to,
      idSubscriptionTypes: idSubscriptionTypes ? Number(idSubscriptionTypes) : undefined,
      paymentStatus,
      idPaymentMethods: idPaymentMethods ? Number(idPaymentMethods) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }

  @Get('sales-report-export/:idClub')
  async getSalesReportExport(
    @Param('idClub', ParseIntPipe) idClub: number,
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('idSubscriptionTypes') idSubscriptionTypes?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('idPaymentMethods') idPaymentMethods?: string,
  ) {
    await this.assertClubAccess(idClub, req.user);
    return this.analyticsService.getSalesReportExport(idClub, {
      from,
      to,
      idSubscriptionTypes: idSubscriptionTypes ? Number(idSubscriptionTypes) : undefined,
      paymentStatus,
      idPaymentMethods: idPaymentMethods ? Number(idPaymentMethods) : undefined,
    });
  }

  @Get('feedback-trends/:idClub')
  async getFeedbackTrends(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    await this.assertClubAccess(idClub, req.user);
    return this.analyticsService.getFeedbackTrends(idClub);
  }
}