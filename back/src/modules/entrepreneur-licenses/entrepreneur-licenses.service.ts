import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntrepreneurLicenseDto } from './dto/create-entrepreneur-licenses.dto';
import { UpdateEntrepreneurLicenseDto } from './dto/update-entrepreneur-licenses.dto';
import { VerificationStatus } from '@prisma/client';

function sanitize(license: any) {
  if (!license) return license;
  if (license.issueDate instanceof Date) license.issueDate = license.issueDate.toISOString();
  if (license.expirationDate instanceof Date) license.expirationDate = license.expirationDate.toISOString();
  if (license.verificationDate instanceof Date) license.verificationDate = license.verificationDate.toISOString();
  return license;
}

@Injectable()
export class EntrepreneurLicensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEntrepreneurLicenseDto) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({
      where: { id: dto.idEntrepreneurs },
    });
    if (!entrepreneur) throw new NotFoundException('Emprendedor no encontrado');

    const licenseType = await this.prisma.license_Types.findUnique({
      where: { id: dto.idLicenseTypes },
    });
    if (!licenseType) throw new NotFoundException('Tipo de licencia no encontrado');

    const created = await this.prisma.entrepreneur_Licenses.create({
      data: {
        idEntrepreneurs: dto.idEntrepreneurs,
        idLicenseTypes: dto.idLicenseTypes,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        documentUrl: dto.documentUrl ?? null,
        verificationNotes: dto.verificationNotes ?? null,
        verificationStatus: VerificationStatus.PENDIENTE,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const licenses = await this.prisma.entrepreneur_Licenses.findMany({
      orderBy: { id: 'asc' },
    });
    return licenses.map(sanitize);
  }

  async findByEntrepreneur(idEntrepreneur: number) {
    const licenses = await this.prisma.entrepreneur_Licenses.findMany({
      where: { idEntrepreneurs: idEntrepreneur },
      orderBy: { id: 'desc' },
    });
    return licenses.map(sanitize);
  }

  async findOne(id: number) {
    const item = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Licencia no encontrada');
    return sanitize(item);
  }

  async update(id: number, dto: UpdateEntrepreneurLicenseDto) {
    const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Licencia no encontrada');

    if ((dto as any).idEntrepreneurs) {
      const e = await this.prisma.entrepreneurs.findUnique({ where: { id: (dto as any).idEntrepreneurs } });
      if (!e) throw new NotFoundException('Emprendedor (nuevo) no encontrado');
    }
    if ((dto as any).idLicenseTypes) {
      const lt = await this.prisma.license_Types.findUnique({ where: { id: (dto as any).idLicenseTypes } });
      if (!lt) throw new NotFoundException('Tipo de licencia (nuevo) no encontrado');
    }

    const updated = await this.prisma.entrepreneur_Licenses.update({
      where: { id },
      data: {
        idEntrepreneurs: (dto as any).idEntrepreneurs ?? existing.idEntrepreneurs,
        idLicenseTypes: (dto as any).idLicenseTypes ?? existing.idLicenseTypes,
        issueDate: (dto as any).issueDate ? new Date((dto as any).issueDate) : existing.issueDate,
        expirationDate: (dto as any).expirationDate ? new Date((dto as any).expirationDate) : existing.expirationDate,
        documentUrl: (dto as any).documentUrl ?? existing.documentUrl,
        verificationNotes: (dto as any).verificationNotes ?? existing.verificationNotes,
      },
    });
    return sanitize(updated);
  }

  async verify(id: number, verificationStatus: string, verificationNotes?: string) {
    const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Licencia no encontrada');

    const allowed = Object.values(VerificationStatus);
    if (!allowed.includes(verificationStatus as VerificationStatus)) {
      throw new BadRequestException(`verificationStatus inválido. Valores permitidos: ${allowed.join(', ')}`);
    }

    const updated = await this.prisma.entrepreneur_Licenses.update({
      where: { id },
      data: {
        verificationStatus: verificationStatus as VerificationStatus,
        verificationDate: new Date(),
        verificationNotes: verificationNotes ?? existing.verificationNotes,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Licencia no encontrada');

    await this.prisma.entrepreneur_Licenses.delete({ where: { id } });
    return { message: 'Licencia eliminada correctamente' };
  }
}