import {
  Body, Controller, Get, Post, Put, Delete, Patch,
  Param, ParseIntPipe, UseGuards, Request, UsePipes,
  ValidationPipe, ForbiddenException, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { EntrepreneurLicensesService } from './entrepreneur-licenses.service';
import { CreateEntrepreneurLicenseDto } from './dto/create-entrepreneur-licenses.dto';
import { UpdateEntrepreneurLicenseDto } from './dto/update-entrepreneur-licenses.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const licenseFileOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(pdf|jpg|jpeg|png)$/)) {
      callback(new Error('Solo se permiten PDF o imágenes'), false);
    } else {
      callback(null, true);
    }
  },
};

@Controller('entrepreneur-licenses')
@UseGuards(JwtAuthGuard)
export class EntrepreneurLicensesController {
  constructor(private readonly service: EntrepreneurLicensesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('document', licenseFileOptions))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateEntrepreneurLicenseDto, @Request() req, @UploadedFile() document?: Express.Multer.File) {
    if (req.user.role !== 'admin' && req.user.id !== dto.idEntrepreneurs) {
      throw new ForbiddenException('No autorizado para crear esta licencia');
    }
    return this.service.create(dto, document);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get('by-entrepreneur/:idEntrepreneur')
  async findByEntrepreneur(@Param('idEntrepreneur', ParseIntPipe) idEntrepreneur: number, @Request() req) {
    if (req.user.id !== idEntrepreneur && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para ver estas licencias');
    }
    return this.service.findByEntrepreneur(idEntrepreneur);
  }

  @Get('required-for-club/:idClub')
  async findRequiredForClub(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    return this.service.findRequiredForClub(idClub, req.user.id, req.user.role);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const item = await this.service.findOne(id);
    if (req.user.id !== item.idEntrepreneurs && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para ver esta licencia');
    }
    return item;
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('document', licenseFileOptions))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEntrepreneurLicenseDto,
    @Request() req,
    @UploadedFile() document?: Express.Multer.File,
  ) {
    const existing = await this.service.findOne(id);
    if (req.user.id !== existing.idEntrepreneurs && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para actualizar esta licencia');
    }
    return this.service.update(id, dto, document);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id/verify')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async verify(@Param('id', ParseIntPipe) id: number, @Body() body: { verificationStatus: string; verificationNotes?: string }) {
    return this.service.verify(id, body.verificationStatus, body.verificationNotes);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}