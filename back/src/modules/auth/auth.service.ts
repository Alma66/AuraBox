import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    let user: any = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.prisma.entrepreneurs.findUnique({ where: { email } });
    }
    if (!user) return null;
    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (!ok) return null;
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  private async getUserRole(userId: number): Promise<string> {
    const adminRole = await this.prisma.adminOrEntrepreneurRole.findFirst({
      where: { assignedTo: userId },
    });
    if (adminRole) {
      const role = await this.prisma.role.findUnique({
        where: { id: adminRole.idRole },
      });
      if (role) return role.code;
    }
    return 'CUSTOMER';
  }

  async loginWithCredentials(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    return this.login(user);
  }

  async login(user: any) {
    const role = await this.getUserRole(user.id);
    const payload = { sub: user.id, email: user.email, role };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }
}