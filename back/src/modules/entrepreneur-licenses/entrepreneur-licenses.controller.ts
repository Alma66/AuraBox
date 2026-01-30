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
  Patch,
} from '@nestjs/common';
import { EntrepreneurLicensesService } from './entrepreneur-licenses.service';
import { CreateEntrepreneurLicenseDto } from './dto/create-entrepreneur-licenses.dto';
import { UpdateEntrepreneurLicenseDto } from './dto/update-entrepreneur-licenses.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('entrepreneur-licenses')
@UseGuards(JwtAuthGuard)
export class EntrepreneurLicensesController {
  constructor(private readonly service: EntrepreneurLicensesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateEntrepreneurLicenseDto, @Request() req) {
    if (req.user.role !== 'ADMIN' && req.user.id !== dto.idEntrepreneurs) {
      throw new ForbiddenException('No autorizado para crear esta licencia');
    }
    return this.service.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get('by-entrepreneur/:idEntrepreneur')
  async findByEntrepreneur(@Param('idEntrepreneur', ParseIntPipe) idEntrepreneur: number, @Request() req) {
    if (req.user.id !== idEntrepreneur && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('No autorizado para ver estas licencias');
    }
    return this.service.findByEntrepreneur(idEntrepreneur);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const item = await this.service.findOne(id);
    if (req.user.id !== item.idEntrepreneurs && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('No autorizado para ver esta licencia');
    }
    return item;
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEntrepreneurLicenseDto, @Request() req) {
    const existing = await this.service.findOne(id);
    if (req.user.id !== existing.idEntrepreneurs && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('No autorizado para actualizar esta licencia');
    }
    return this.service.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Put(':id/verify')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async verify(@Param('id', ParseIntPipe) id: number, @Body() body: { verificationStatus: string; verificationNotes?: string }) {
    return this.service.verify(id, body.verificationStatus, body.verificationNotes);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}