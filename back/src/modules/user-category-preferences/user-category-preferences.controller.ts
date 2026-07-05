import { Body, Controller, Get, Put, UseGuards, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { UserCategoryPreferencesService } from './user-category-preferences.service';
import { SetUserCategoryPreferencesDto } from './dto/set-user-category-preferences.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('user-category-preferences')
@UseGuards(JwtAuthGuard)
export class UserCategoryPreferencesController {
  constructor(private readonly svc: UserCategoryPreferencesService) {}

  @Get('me')
  async getMine(@Request() req: any) {
    return this.svc.findByUser(req.user.id);
  }

  @Put('me')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async setMine(@Body() dto: SetUserCategoryPreferencesDto, @Request() req: any) {
    return this.svc.replace(req.user.id, dto.categoryIds);
  }
}