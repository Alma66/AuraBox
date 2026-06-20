import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Patch, UseGuards, UsePipes, ValidationPipe,
  Request, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ShipmentsService } from '../shipments/shipments.service';
import { RiderProfileService } from '../rider-profile/rider-profile.service';
import { AssignDeliveryDto } from '../shipments/dto/assign-delivery.dto';

@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly clubsService: ClubsService,
    private readonly shipmentsService: ShipmentsService,
    private readonly riderProfileService: RiderProfileService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateClubDto) {
    return this.clubsService.create(dto);
  }

  @Public()
  @Get()
  async findAll() {
    return this.clubsService.findAll();
  }

  @Public()
  @Get('featured')
  async findFeatured() {
    return this.clubsService.findFeatured();
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.clubsService.findOne(id, req.user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur')
  @Get(':id/user-subscriptions')
  async getClubSubscriptions(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.clubsService.findSubscriptionsByClub(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur')
  @Get(':id/customers')
  async getClubCustomers(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.clubsService.findCustomersByClub(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur')
  @Get(':id/deliveries')
  async getClubDeliveries(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.clubsService.assertOwnership(id, req.user.id);
    return this.shipmentsService.findByClub(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur')
  @Get(':id/riders')
  async getClubRiders(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.clubsService.assertOwnership(id, req.user.id);
    return this.riderProfileService.findByClub(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur')
  @Put(':id/deliveries/:shipmentId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async assignDelivery(
    @Param('id', ParseIntPipe) id: number,
    @Param('shipmentId', ParseIntPipe) shipmentId: number,
    @Body() dto: AssignDeliveryDto,
    @Request() req,
  ) {
    await this.clubsService.assertOwnership(id, req.user.id);
    return this.shipmentsService.assignRiderForClub(shipmentId, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClubDto, @Request() req) {
    return this.clubsService.update(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur')
  @Patch(':id/logo')
  @UseInterceptors(FileInterceptor('logo'))
  async updateLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.clubsService.updateLogo(id, file, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.clubsService.remove(id);
  }
}