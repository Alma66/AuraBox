import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Patch, UseGuards, UsePipes, ValidationPipe,
  Request, ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get('me')
  async getMe(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Post('me/verify-password')
  async verifyPassword(@Request() req: any, @Body() body: { password: string }) {
    return this.usersService.verifyPassword(req.user.id, body.password);
  }

  @Patch('me')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }

  @Get('newsletter-subscribers/:idClub')
  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  async getNewsletterSubscribers(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.usersService.findSubscribersByClub(idClub);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'customer')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('No autorizado');
    }
    return this.usersService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'customer')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto, @Request() req: any) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('No autorizado');
    }
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}