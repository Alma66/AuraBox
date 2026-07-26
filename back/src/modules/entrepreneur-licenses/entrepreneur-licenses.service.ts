import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntrepreneurLicenseDto } from './dto/create-entrepreneur-licenses.dto';
import { UpdateEntrepreneurLicenseDto } from './dto/update-entrepreneur-licenses.dto';
import { VerificationStatus } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

function sanitize(license: any) {
  if (!license) return license;
  if (license.issueDate instanceof Date) license.issueDate = license.issueDate.toISOString();
  if (license.expirationDate instanceof Date) license.expirationDate = license.expirationDate.toISOString();
  if (license.verificationDate instanceof Date) license.verificationDate = license.verificationDate.toISOString();
  return license;
}

@Injectable()
export class EntrepreneurLicensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(dto: CreateEntrepreneurLicenseDto, documentFile?: Express.Multer.File) {
    const entrepreneur = await this.prisma.entrepreneurs.findUnique({
      where: { id: dto.idEntrepreneurs },
    });
    if (!entrepreneur) throw new NotFoundException('Emprendedor no encontrado');

    const licenseType = await this.prisma.license_Types.findUnique({
      where: { id: dto.idLicenseTypes },
    });
    if (!licenseType) throw new NotFoundException('Tipo de licencia no encontrado');

    const duplicate = await this.prisma.entrepreneur_Licenses.findFirst({
      where: { idEntrepreneurs: dto.idEntrepreneurs, idLicenseTypes: dto.idLicenseTypes },
    });
    if (duplicate) throw new ConflictException('Ya existe una licencia de este tipo para este emprendedor');

    let documentUrl = dto.documentUrl ?? null;
    if (documentFile) {
      documentUrl = await this.cloudinary.uploadDocument(documentFile, 'aurabox/licenses');
    }

    const created = await this.prisma.entrepreneur_Licenses.create({
      data: {
        idEntrepreneurs: dto.idEntrepreneurs,
        idLicenseTypes: dto.idLicenseTypes,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        documentUrl,
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

  async update(id: number, dto: UpdateEntrepreneurLicenseDto, documentFile?: Express.Multer.File) {
    const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Licencia no encontrada');

    let documentUrl = dto.documentUrl ?? existing.documentUrl;
    let verificationStatus = existing.verificationStatus;
    let verificationDate = existing.verificationDate;
    let verificationNotes = dto.verificationNotes ?? existing.verificationNotes;

    if (documentFile) {
      if (existing.documentUrl) {
        const publicId = this.cloudinary.extractPublicId(existing.documentUrl);
        await this.cloudinary.deleteImage(publicId);
      }
      documentUrl = await this.cloudinary.uploadDocument(documentFile, 'aurabox/licenses');
      verificationStatus = VerificationStatus.PENDIENTE;
      verificationDate = null;
      verificationNotes = null;
    }

    const updated = await this.prisma.entrepreneur_Licenses.update({
      where: { id },
      data: {
        issueDate: dto.issueDate ? new Date(dto.issueDate) : existing.issueDate,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : existing.expirationDate,
        documentUrl,
        verificationStatus,
        verificationDate,
        verificationNotes,
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

  async findRequiredForClub(idClub: number, requesterId: number, requesterRole: string) {
    const club = await this.prisma.club.findUnique({ where: { id: idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    if (requesterRole !== 'admin') {
      const association = await this.prisma.entrepreneur_Club.findFirst({
        where: { idClub, idEntrepreneurs: requesterId },
      });
      if (!association) throw new ForbiddenException('No autorizado para ver estos requisitos');
    }
    const clubCategories = await this.prisma.club_Categories.findMany({ where: { idClub } });
    const categoryIds = clubCategories.map((c) => c.idCategories);
    const requiredLinks = categoryIds.length > 0
      ? await this.prisma.category_License_Type.findMany({ where: { idCategories: { in: categoryIds } } })
      : [];
    const requiredLicenseTypeIds = Array.from(new Set(requiredLinks.map((l) => l.idLicenseTypes)));
    const licenseTypes = requiredLicenseTypeIds.length > 0
      ? await this.prisma.license_Types.findMany({ where: { id: { in: requiredLicenseTypeIds } } })
      : [];
    const entrepreneurClub = await this.prisma.entrepreneur_Club.findFirst({ where: { idClub } });
    const idEntrepreneurs = entrepreneurClub?.idEntrepreneurs ?? null;
    const uploadedLicenses = idEntrepreneurs
      ? await this.prisma.entrepreneur_Licenses.findMany({
          where: { idEntrepreneurs, idLicenseTypes: { in: requiredLicenseTypeIds } },
        })
      : [];
    return licenseTypes.map((licenseType) => {
      const uploaded = uploadedLicenses.find((u) => u.idLicenseTypes === licenseType.id);
      return {
        idLicenseTypes: licenseType.id,
        name: licenseType.name,
        description: licenseType.description,
        entrepreneurLicenseId: uploaded?.id ?? null,
        verificationStatus: uploaded?.verificationStatus ?? null,
        documentUrl: uploaded?.documentUrl ?? null,
        issueDate: uploaded?.issueDate ? uploaded.issueDate.toISOString() : null,
        expirationDate: uploaded?.expirationDate ? uploaded.expirationDate.toISOString() : null,
        verificationNotes: uploaded?.verificationNotes ?? null,
      };
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Licencia no encontrada');
    if (existing.documentUrl) {
      const publicId = this.cloudinary.extractPublicId(existing.documentUrl);
      await this.cloudinary.deleteImage(publicId);
    }
    await this.prisma.entrepreneur_Licenses.delete({ where: { id } });
    return { message: 'Licencia eliminada correctamente' };
  }
}