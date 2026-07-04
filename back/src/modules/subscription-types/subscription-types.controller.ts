import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Patch, UseGuards, Request, UsePipes,
  ValidationPipe, Query, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SubscriptionTypesService } from './subscription-types.service';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-types.dto';
import { UpdateSubscriptionTypeDto } from './dto/update-subscription-types.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('subscription-types')
@UseGuards(JwtAuthGuard)
export class SubscriptionTypesController {
  constructor(private readonly svc: SubscriptionTypesService) {}

  @Public()
  @Get()
  async findAll(@Query('clubId') clubId?: string) {
    if (clubId) return this.svc.findByClub(Number(clubId));
    return this.svc.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findById(id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateSubscriptionTypeDto, @Request() req) {
    return this.svc.create(dto, req.user?.id, req.user?.role);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubscriptionTypeDto,
    @Request() req,
  ) {
    return this.svc.update(id, dto, req.user?.id, req.user?.role);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Patch(':id/image')
  @UseInterceptors(FileInterceptor('file', {
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
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.svc.updateImage(id, file, req.user?.id, req.user?.role);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.remove(id, req.user?.id, req.user?.role);
  }
}