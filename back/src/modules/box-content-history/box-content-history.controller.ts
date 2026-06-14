import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, Request, UsePipes,
  ValidationPipe, Query, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BoxContentHistoryService } from './box-content-history.service';
import { CreateBoxContentHistoryDto } from './dto/create-box-content-history.dto';
import { UpdateBoxContentHistoryDto } from './dto/update-box-content-history.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('box-content-history')
@UseGuards(JwtAuthGuard)
export class BoxContentHistoryController {
  constructor(private readonly svc: BoxContentHistoryService) {}

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        callback(new Error('Solo se permiten imágenes'), false);
      } else {
        callback(null, true);
      }
    },
  }))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() dto: CreateBoxContentHistoryDto,
    @Request() req,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.svc.create(dto, image);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(@Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.svc.findAll(page ? parseInt(page, 10) : 1, perPage ? parseInt(perPage, 10) : 50);
  }

  @Get('by-subscription-type/:idSubscriptionTypes')
  async findBySubscriptionType(@Param('idSubscriptionTypes', ParseIntPipe) idSubscriptionTypes: number) {
    return this.svc.findBySubscriptionType(idSubscriptionTypes);
  }

  @Get('by-delivery-month/:deliveryMonthYear')
  async findByDeliveryMonth(@Param('deliveryMonthYear') deliveryMonthYear: string) {
    return this.svc.findByDeliveryMonth(deliveryMonthYear);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBoxContentHistoryDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}