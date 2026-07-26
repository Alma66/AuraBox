import {
  Body, Controller, Get, Post, Delete,
  Param, ParseIntPipe, UseGuards, UsePipes, ValidationPipe, Patch, Request,
} from '@nestjs/common';
import { ClubCategoriesService } from './club-categories.service';
import { CreateClubCategoryDto } from './dto/create-club-category.dto';
import { UpdateClubCategoryDto } from './dto/update-club-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('club-categories')
@UseGuards(JwtAuthGuard)
export class ClubCategoriesController {
  constructor(private readonly service: ClubCategoriesService) {}

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateClubCategoryDto, @Request() req) {
    return this.service.create(dto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.service.findByClub(idClub);
  }

  @Get('by-category/:idCategory')
  async findByCategory(@Param('idCategory', ParseIntPipe) idCategory: number) {
    return this.service.findByCategory(idCategory);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClubCategoryDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}