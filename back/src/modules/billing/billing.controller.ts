import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BillingService } from './billing.service';

@Controller('admin/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Post('run-renewals')
  async runRenewals() {
    return this.billing.run();
  }
}