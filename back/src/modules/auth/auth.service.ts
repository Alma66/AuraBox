import { Injectable, UnauthorizedException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { RuleAcceptanceScope } from '@prisma/client';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CompleteCustomerProfileDto,
  CreateClubDto,
  RegisterClubDto,
  RegisterCustomerDto,
  RegisterEntrepreneurDto,
} from './dto/register.dto';

type AccountAudience = 'customer' | 'entrepreneur';

const MAX_FAILED_LOGINS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_EMAILS = 5000;
const DUMMY_HASH = bcrypt.hashSync('aurabox-dummy-password', 10);
const PASSWORD_HASH_ROUNDS = 12;

interface LoginAttempt {
  failures: number;
  windowStart: number;
  lockedUntil: number;
}

const ageOn = (birth: Date, today: Date = new Date()) => {
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  private readonly loginAttempts = new Map<string, LoginAttempt>();

  private pruneLoginAttempts(now: number) {
    if (this.loginAttempts.size < MAX_TRACKED_EMAILS) return;
    for (const [key, attempt] of this.loginAttempts) {
      if (attempt.lockedUntil < now && now - attempt.windowStart > LOGIN_WINDOW_MS) {
        this.loginAttempts.delete(key);
      }
    }
  }

  private assertNotLocked(key: string) {
    const attempt = this.loginAttempts.get(key);
    const now = Date.now();
    if (attempt && attempt.lockedUntil > now) {
      const minutes = Math.max(1, Math.ceil((attempt.lockedUntil - now) / 60000));
      throw new HttpException(
        `Demasiados intentos fallidos. Probá de nuevo en ${minutes} minuto${minutes === 1 ? '' : 's'}.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private registerFailedLogin(key: string) {
    const now = Date.now();
    this.pruneLoginAttempts(now);
    const current = this.loginAttempts.get(key);
    const attempt: LoginAttempt =
      current && now - current.windowStart <= LOGIN_WINDOW_MS
        ? current
        : { failures: 0, windowStart: now, lockedUntil: 0 };
    attempt.failures += 1;
    if (attempt.failures >= MAX_FAILED_LOGINS) {
      attempt.lockedUntil = now + LOGIN_WINDOW_MS;
      attempt.failures = 0;
      attempt.windowStart = now;
    }
    this.loginAttempts.set(key, attempt);
  }
  
  async validateUser(email: string, pass: string): Promise<any> {
    const lookup = { equals: email.trim(), mode: 'insensitive' as const };
    let user: any = null;
    let role = 'customer';

    const foundUser = await this.prisma.user.findFirst({ where: { email: lookup } });
    if (foundUser) {
      user = foundUser;
      role = 'customer';
    }

    if (!user) {
      const foundEntrepreneur = await this.prisma.entrepreneurs.findFirst({ where: { email: lookup } });
      if (foundEntrepreneur) {
        user = foundEntrepreneur;
        role = 'entrepreneur';
      }
    }

    if (!user) {
      const foundAdmin = await this.prisma.admins.findFirst({ where: { email: lookup } });
      if (foundAdmin) {
        user = foundAdmin;
        role = 'admin';
      }
    }

    if (!user) {
      await bcrypt.compare(pass, DUMMY_HASH);
      return null;
    }

    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (!ok) return null;

    if (user.active === false) {
      throw new UnauthorizedException('Cuenta deshabilitada');
    }

    const { passwordHash, ...safe } = user as any;
    return { ...safe, role };
  }

  async loginWithCredentials(email: string, password: string) {
    const key = email.trim().toLowerCase();
    this.assertNotLocked(key);
    const user = await this.validateUser(email, password);
    if (!user) {
      this.registerFailedLogin(key);
      throw new UnauthorizedException('Credenciales inválidas');
    }
    this.loginAttempts.delete(key);
    return this.buildToken(user);
  }

  async buildToken(user: any) {
    let managedClubId: number | null = null;

    if (user.role === 'entrepreneur') {
      const association = await this.prisma.entrepreneur_Club.findFirst({
        where: { idEntrepreneurs: user.id },
        orderBy: { associationDate: 'asc' },
      });

      if (association) managedClubId = association.idClub;
    }

    const payload: any = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    if (managedClubId) payload.managedClubId = managedClubId;

    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }

  private signRegistrationToken(id: number, purpose: string, expiresInSeconds: number) {
    return this.jwtService.sign({ sub: id, purpose }, { expiresIn: expiresInSeconds });
  }

  private verifyRegistrationToken(token: string, expectedPurpose: string): number {
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token de registro inválido o expirado');
    }
    if (payload.purpose !== expectedPurpose) {
      throw new UnauthorizedException('Token de registro inválido');
    }
    return payload.sub;
  }

  private async emailInUse(email: string) {
    const lookup = { equals: email.trim(), mode: 'insensitive' as const };
    const [customer, entrepreneur, admin] = await Promise.all([
      this.prisma.user.findFirst({ where: { email: lookup } }),
      this.prisma.entrepreneurs.findFirst({ where: { email: lookup } }),
      this.prisma.admins.findFirst({ where: { email: lookup } }),
    ]);
    return !!(customer || entrepreneur || admin);
  }

  private async resolveRequiredRules(audience: AccountAudience, acceptedRuleIds: number[] = []) {
    const scopes: RuleAcceptanceScope[] = [
      RuleAcceptanceScope.TODOS,
      audience === 'customer' ? RuleAcceptanceScope.CLIENTES : RuleAcceptanceScope.EMPRENDEDORES,
    ];

    const required = await this.prisma.platform_Rules.findMany({
      where: { active: true, acceptanceScope: { in: scopes } },
      select: { id: true, title: true, version: true },
    });

    const accepted = new Set(acceptedRuleIds);
    const missing = required.filter((rule) => !accepted.has(rule.id));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Falta tu aceptación de: ${missing.map((rule) => rule.title).join(', ')}. Si los documentos cambiaron, recargá la página y volvé a aceptarlos.`,
      );
    }

    return required;
  }

  async registerCustomer(dto: RegisterCustomerDto) {
    if (await this.emailInUse(dto.email)) throw new BadRequestException('Ese email ya está registrado');

    const documentNumber = parseInt(dto.documentNumber, 10);
    const exists = await this.prisma.user.findFirst({ where: { documentNumber } });
    if (exists) throw new BadRequestException('Ese documento ya está registrado');

    const birthDate = new Date(dto.birthDate);
    if (ageOn(birthDate) < 16) {
      throw new BadRequestException('Debes tener al menos 16 años para registrarte como cliente.');
    }

    const requiredRules = await this.resolveRequiredRules('customer', dto.acceptedRuleIds);

    const hashed = await bcrypt.hash(dto.password, PASSWORD_HASH_ROUNDS);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          passwordHash: hashed,
          documentType: dto.documentType as any,
          documentNumber,
          phoneNumber: dto.phoneNumber ?? null,
          birthDate,
        },
      });

      if (requiredRules.length > 0) {
        await tx.terms_Acceptance.createMany({
          data: requiredRules.map((rule) => ({
            accountType: 'customer',
            idAccount: created.id,
            idPlatformRule: rule.id,
            ruleVersion: rule.version,
          })),
        });
      }

      return created;
    });

    const { passwordHash, ...safe } = user as any;
    const profileToken = this.signRegistrationToken(user.id, 'complete-profile', 15 * 60);
    return { ...safe, role: 'customer', profileToken };
  }

  async completeCustomerProfile(dto: CompleteCustomerProfileDto) {
    const userId = this.verifyRegistrationToken(dto.profileToken, 'complete-profile');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        streetAddress: dto.streetAddress ?? null,
        addressNumber: dto.addressNumber ?? null,
        floorNumber: dto.floorNumber ?? null,
        addressDetails: dto.addressDetails ?? null,
        city: dto.city ?? null,
        province: dto.province ?? null,
        postalCode: dto.postalCode ?? null,
      },
    });

    const { passwordHash, ...safe } = updated as any;
    return safe;
  }

  async registerEntrepreneur(dto: RegisterEntrepreneurDto) {
    if (await this.emailInUse(dto.email)) throw new BadRequestException('Ese email ya está registrado');

    const documentNumber = parseInt(dto.documentNumber, 10);
    const exists = await this.prisma.entrepreneurs.findFirst({ where: { documentNumber } });
    if (exists) throw new BadRequestException('Ese documento ya está registrado');

    const birthDate = new Date(dto.birthDate);
    if (ageOn(birthDate) < 18) {
      throw new BadRequestException('Debes tener al menos 18 años para registrarte como emprendedor.');
    }

    const requiredRules = await this.resolveRequiredRules('entrepreneur', dto.acceptedRuleIds);

    const hashed = await bcrypt.hash(dto.password, PASSWORD_HASH_ROUNDS);

    const entrepreneur = await this.prisma.$transaction(async (tx) => {
      const created = await tx.entrepreneurs.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          passwordHash: hashed,
          documentType: dto.documentType as any,
          documentNumber,
          phoneNumber: dto.phoneNumber ?? null,
          birthDate,
          city: dto.city ?? null,
          province: dto.province ?? null,
        },
      });

      if (requiredRules.length > 0) {
        await tx.terms_Acceptance.createMany({
          data: requiredRules.map((rule) => ({
            accountType: 'entrepreneur',
            idAccount: created.id,
            idPlatformRule: rule.id,
            ruleVersion: rule.version,
          })),
        });
      }

      return created;
    });

    const { passwordHash, ...safe } = entrepreneur as any;
    const entrepreneurToken = this.signRegistrationToken(entrepreneur.id, 'entrepreneur-club', 30 * 60);
    return { ...safe, role: 'entrepreneur', entrepreneurToken };
  }

    private async createClubFor(entrepreneurId: number, dto: CreateClubDto) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({
      where: { id: entrepreneurId },
    });
    if (!entrepreneur) throw new BadRequestException('Emprendedor no encontrado');

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.entrepreneur_Club.findFirst({
        where: { idEntrepreneurs: entrepreneurId },
      });
      if (existing) throw new BadRequestException('Este emprendedor ya tiene un club registrado');

      const club = await tx.club.create({
        data: {
          name: dto.name,
          logoUrl: dto.logoUrl ?? '',
          slogan: dto.slogan ?? null,
          history: dto.history ?? null,
          shortDescription: dto.shortDescription,
          contactEmail: dto.contactEmail,
          whatsappContact: dto.whatsappContact ?? null,
          clubStatus: 'PENDIENTE_APROBACION',
        },
      });

      await tx.entrepreneur_Club.create({
        data: {
          idEntrepreneurs: entrepreneurId,
          idClub: club.id,
        },
      });

      return club;
    });
  }

  async registerEntrepreneurClub(dto: RegisterClubDto) {
    const entrepreneurId = this.verifyRegistrationToken(dto.entrepreneurToken, 'entrepreneur-club');
    return this.createClubFor(entrepreneurId, dto);
  }

  async createClubForSession(entrepreneurId: number, dto: CreateClubDto) {
    const club = await this.createClubFor(entrepreneurId, dto);
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: entrepreneurId } });
    const { access_token } = await this.buildToken({ ...(entrepreneur as any), role: 'entrepreneur' });
    return { club, access_token };
  }
}