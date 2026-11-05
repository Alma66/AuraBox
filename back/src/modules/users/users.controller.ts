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
import { Throttle } from '@nestjs/throttler';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Roles('customer')
  @Get('me')
  async getMe(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

 @Roles('customer')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('me/verify-password')
  async verifyPassword(@Request() req: any, @Body() body: { password: string }) {
    return this.usersService.verifyPassword(req.user.id, body.password);
  }

 @Roles('customer')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('me/deactivate')
  async deactivateMe(@Request() req: any, @Body() body: { password: string }) {
    return this.usersService.deactivate(req.user.id, body.password);
  }

  @Roles('customer')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch('me')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
    delete (dto as any).active;
    return this.usersService.update(req.user.id, dto, true);
  }

  @Roles('entrepreneur', 'admin')
  @Get('newsletter-subscribers/:idClub')
  async getNewsletterSubscribers(@Param('idClub', ParseIntPipe) idClub: number, @Request() req: any) {
    return this.usersService.findNewsletterRecipients(idClub, req.user);
  }

  @Roles('admin')
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Roles('admin', 'customer')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('No autorizado');
    }
    return this.usersService.findById(id);
  }

  @Roles('admin', 'customer')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto, @Request() req: any) {
    if (req.user.role !== 'admin') {
      if (req.user.id !== id) {
        throw new ForbiddenException('No autorizado');
      }
      delete (dto as any).active;
    }
    return this.usersService.update(id, dto, req.user.role !== 'admin');
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}