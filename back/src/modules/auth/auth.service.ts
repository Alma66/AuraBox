import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
    let user: any = null;
    let role = 'customer';

    const foundUser = await this.prisma.user.findUnique({ where: { email } });
    if (foundUser) {
      user = foundUser;
      role = 'customer';
    }

    if (!user) {
      const foundEntrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { email } });
      if (foundEntrepreneur) {
        user = foundEntrepreneur;
        role = 'entrepreneur';
      }
    }

    if (!user) {
      const foundAdmin = await this.prisma.admins.findUnique({ where: { email } });
      if (foundAdmin) {
        user = foundAdmin;
        role = 'admin';
      }
    }

    if (!user) return null;

    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (!ok) return null;

    if (role === 'customer' && user.active === false) {
      throw new UnauthorizedException('Cuenta deshabilitada');
    }

    const { passwordHash, ...safe } = user as any;
    return { ...safe, role };
  }

  async loginWithCredentials(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    return this.buildToken(user);
  }

  async buildToken(user: any) {
    let managedClubId: number | null = null;

    if (user.role === 'entrepreneur') {
      const association = await this.prisma.entrepreneur_Club.findFirst({
        where: { idEntrepreneurs: user.id },
        orderBy: { associationDate: 'desc' },
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

  async registerCustomer(dto: any) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { documentNumber: parseInt(dto.documentNumber) }] },
    });
    if (exists) throw new BadRequestException('Email o documento ya registrado');

    const birthDate = new Date(dto.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 16) throw new BadRequestException('Debes tener al menos 16 años para registrarte como cliente.');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash: hashed,
        documentType: dto.documentType,
        documentNumber: parseInt(dto.documentNumber),
        phoneNumber: dto.phoneNumber ? parseInt(dto.phoneNumber) : null,
        birthDate: new Date(dto.birthDate),
      },
    });

    const { passwordHash, ...safe } = user as any;
    const profileToken = this.signRegistrationToken(user.id, 'complete-profile', 15 * 60);
    return { ...safe, role: 'customer', profileToken };
  }

  async completeCustomerProfile(dto: any) {
    const { profileToken, streetAddress, addressNumber, floorNumber, addressDetails, city, province, postalCode } = dto;

    if (!profileToken) throw new BadRequestException('profileToken es requerido');

    const userId = this.verifyRegistrationToken(profileToken, 'complete-profile');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        streetAddress: streetAddress ?? null,
        addressNumber: addressNumber ? parseInt(addressNumber) : null,
        floorNumber: floorNumber ?? null,
        addressDetails: addressDetails ?? null,
        city: city ?? null,
        province: province ?? null,
        postalCode: postalCode ?? null,
      },
    });

    const { passwordHash, ...safe } = updated as any;
    return safe;
  }

  async registerEntrepreneur(dto: any) {
    const exists = await this.prisma.entrepreneurs.findFirst({
      where: { OR: [{ email: dto.email }, { documentNumber: parseInt(dto.documentNumber) }] },
    });
    if (exists) throw new BadRequestException('Email o documento ya registrado');

    const birthDate = new Date(dto.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) throw new BadRequestException('Debes tener al menos 18 años para registrarte como emprendedor.');

    const hashed = await bcrypt.hash(dto.password, 10);

    const entrepreneur = await this.prisma.entrepreneurs.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash: hashed,
        documentType: dto.documentType,
        documentNumber: parseInt(dto.documentNumber),
        phoneNumber: dto.phoneNumber ? parseInt(dto.phoneNumber) : null,
        birthDate: new Date(dto.birthDate),
        city: dto.city ?? null,
        province: dto.province ?? null,
      },
    });

    const { passwordHash, ...safe } = entrepreneur as any;
    const entrepreneurToken = this.signRegistrationToken(entrepreneur.id, 'entrepreneur-club', 30 * 60);
    return { ...safe, role: 'entrepreneur', entrepreneurToken };
  }

  async registerEntrepreneurClub(dto: any) {
    const { entrepreneurToken, name, logoUrl, shortDescription, contactEmail, slogan, history, whatsappContact } = dto;

    if (!entrepreneurToken) throw new BadRequestException('entrepreneurToken es requerido');

    const entrepreneurId = this.verifyRegistrationToken(entrepreneurToken, 'entrepreneur-club');

    const entrepreneur = await this.prisma.entrepreneurs.findUnique({
      where: { id: entrepreneurId },
    });
    if (!entrepreneur) throw new BadRequestException('Emprendedor no encontrado');

    const club = await this.prisma.club.create({
      data: {
        name,
        logoUrl: logoUrl ?? '',
        slogan: slogan ?? null,
        history: history ?? null,
        shortDescription,
        contactEmail,
        whatsappContact: whatsappContact ?? null,
        clubStatus: 'PENDIENTE_APROBACION',
      },
    });

    await this.prisma.entrepreneur_Club.create({
      data: {
        idEntrepreneurs: entrepreneurId,
        idClub: club.id,
      },
    });

    return club;
  }
}