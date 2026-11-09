import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any) {
    const id = Number(payload?.sub);
    const role = payload?.role;
    if (!Number.isInteger(id)) throw new UnauthorizedException();

    let account: { active: boolean } | null = null;
    if (role === 'customer') {
      account = await this.prisma.user.findUnique({ where: { id }, select: { active: true } });
    } else if (role === 'entrepreneur') {
      account = await this.prisma.entrepreneurs.findUnique({ where: { id }, select: { active: true } });
    } else if (role === 'admin') {
      account = await this.prisma.admins.findUnique({ where: { id }, select: { active: true } });
    }

    if (!account || account.active === false) {
      throw new UnauthorizedException('Cuenta deshabilitada');
    }

    return { id, email: payload.email, role };
  }
}