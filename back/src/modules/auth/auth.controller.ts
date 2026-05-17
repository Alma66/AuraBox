import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(@Body() dto: LoginDto) {
    return this.authService.loginWithCredentials(dto.email, dto.password);
  }

  @Public()
  @Post('register/customer')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async registerCustomer(@Body() dto: any) {
    return this.authService.registerCustomer(dto);
  }

  @Public()
  @Post('register/entrepreneur')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async registerEntrepreneur(@Body() dto: any) {
    return this.authService.registerEntrepreneur(dto);
  }

  @Public()
  @Post('register/entrepreneur/club')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async registerEntrepreneurClub(@Body() dto: any) {
    return this.authService.registerEntrepreneurClub(dto);
  }

  @Public()
  @Post('register/customer/complete-profile')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async completeCustomerProfile(@Body() dto: any) {
    return this.authService.completeCustomerProfile(dto);
  }
}