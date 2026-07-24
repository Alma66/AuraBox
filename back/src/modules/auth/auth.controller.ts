import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(@Body() dto: LoginDto) {
    return this.authService.loginWithCredentials(dto.email, dto.password);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register/customer')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async registerCustomer(@Body() dto: any) {
    return this.authService.registerCustomer(dto);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register/entrepreneur')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async registerEntrepreneur(@Body() dto: any) {
    return this.authService.registerEntrepreneur(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register/entrepreneur/club')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async registerEntrepreneurClub(@Body() dto: any) {
    return this.authService.registerEntrepreneurClub(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register/customer/complete-profile')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async completeCustomerProfile(@Body() dto: any) {
    return this.authService.completeCustomerProfile(dto);
  }
}