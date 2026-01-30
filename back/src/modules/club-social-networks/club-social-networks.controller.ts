import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ClubSocialNetworksService } from './club-social-networks.service';
import { CreateClubSocialNetworkDto } from './dto/create-club-social-network.dto';
import { UpdateClubSocialNetworkDto } from './dto/update-club-social-network.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('club-social-networks')
@UseGuards(JwtAuthGuard) 
export class ClubSocialNetworksController {
  constructor(private readonly svc: ClubSocialNetworksService) {}

  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateClubSocialNetworkDto, @Request() req) {
    return this.svc.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.svc.findByClub(idClub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClubSocialNetworkDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}