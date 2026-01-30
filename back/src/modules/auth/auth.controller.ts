import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateEntrepreneurDto } from '../entrepreneurs/dto/create-entrepreneurs.dto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';  

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,    
  ) {}

  @Public()
  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(@Body() dto: LoginDto) {
    return this.authService.loginWithCredentials(dto.email, dto.password);
  }

  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(@Body() dto: any) { 
    const { userType, ...data } = dto;
    if (userType === 'customer') {
      const birthDate = new Date(data.birthDate);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 16) throw new Error('Debes tener al menos 16 años para registrarte como cliente.');
      const hashed = await bcrypt.hash(data.password, 10);
      const user = await this.prisma.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash: hashed,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          phoneNumber: data.phoneNumber,
          birthDate: new Date(data.birthDate),
        },
      });
      return user;
    } else if (userType === 'entrepreneur') {
      const birthDate = new Date(data.birthDate);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 18) throw new Error('Debes tener al menos 18 años para registrarte como emprendedor.');
      const hashed = await bcrypt.hash(data.password, 10);
      const entrepreneur = await this.prisma.entrepreneurs.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash: hashed,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          phoneNumber: data.phoneNumber,
          birthDate: new Date(data.birthDate),
          city: data.city,
          province: data.province,
        },
      });
      return entrepreneur;
    } else {
      throw new Error('Tipo de usuario inválido.');
    }
  }
}