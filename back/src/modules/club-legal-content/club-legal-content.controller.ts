import { Body, Controller, Get, Put, Param, ParseIntPipe, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClubLegalContentService } from './club-legal-content.service';
import { UpdateClubLegalContentDto } from './dto/update-club-legal-content.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('club-legal-content')
export class ClubLegalContentController {
  constructor(private readonly service: ClubLegalContentService) {}

  @Public()
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.service.findByClub(idClub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur')
  @Put('by-club/:idClub')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async upsert(
    @Param('idClub', ParseIntPipe) idClub: number,
    @Body() dto: UpdateClubLegalContentDto,
    @Request() req,
  ) {
    return this.service.upsert(idClub, dto, req.user.id);
  }
}