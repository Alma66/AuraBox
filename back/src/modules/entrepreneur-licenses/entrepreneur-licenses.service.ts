import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntrepreneurLicenseDto } from './dto/create-entrepreneur-licenses.dto';
import { UpdateEntrepreneurLicenseDto } from './dto/update-entrepreneur-licenses.dto';
import { VerifyLicenseDto } from './dto/verify-license.dto';
import { VerificationStatus } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { getLicenseRequirements, summarizeRequirements } from '../../common/utils/license-requirements';

type RequestUser = { id: number; role: string };

const DAY_MS = 24 * 60 * 60 * 1000;

function sanitize(license: any) {
  if (!license) return license;
  if (license.issueDate instanceof Date) license.issueDate = license.issueDate.toISOString();
  if (license.expirationDate instanceof Date) license.expirationDate = license.expirationDate.toISOString();
  if (license.verificationDate instanceof Date) license.verificationDate = license.verificationDate.toISOString();
  license.hasDocument = Boolean(license.documentUrl);
  delete license.documentUrl;
  return license;
}

@Injectable()
export class EntrepreneurLicensesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EntrepreneurLicensesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  onApplicationBootstrap() {
    this.secureExistingDocuments()
      .then((result) => {
        if (result.total > 0) {
          this.logger.log(`Documentos de licencia protegidos: ${result.secured} de ${result.total}`);
        }
      })
      .catch((error) => this.logger.error(`No se pudieron proteger los documentos: ${(error as Error).message}`));
  }

  async secureExistingDocuments() {
    const legacy = await this.prisma.entrepreneur_Licenses.findMany({
      where: { documentUrl: { contains: '/raw/upload/' } },
      select: { id: true, documentUrl: true },
    });
    let secured = 0;
    for (const license of legacy) {
      try {
        const newUrl = await this.cloudinary.secureDocument(license.documentUrl as string);
        if (newUrl) {
          await this.prisma.entrepreneur_Licenses.update({
            where: { id: license.id },
            data: { documentUrl: newUrl },
          });
          secured += 1;
        }
      } catch (error) {
        this.logger.error(`No se pudo proteger la licencia ${license.id}: ${(error as Error).message}`);
      }
    }
    return { total: legacy.length, secured };
  }

  private assertDates(issueDate: Date | null, expirationDate: Date | null, requireFutureExpiry: boolean) {
    if (issueDate && expirationDate && expirationDate.getTime() <= issueDate.getTime()) {
      throw new BadRequestException('El vencimiento debe ser posterior a la fecha de emisión');
    }
    if (requireFutureExpiry && expirationDate && expirationDate.getTime() < Date.now()) {
      throw new BadRequestException('La matrícula que intentás cargar ya está vencida');
    }
  }

  async create(dto: CreateEntrepreneurLicenseDto, user: RequestUser, documentFile?: Express.Multer.File) {
    let idEntrepreneurs: number;
    if (user.role === 'admin') {
      if (!dto.idEntrepreneurs) throw new BadRequestException('Indicá el emprendedor');
      idEntrepreneurs = dto.idEntrepreneurs;
    } else {
      if (dto.idEntrepreneurs && dto.idEntrepreneurs !== user.id) {
        throw new ForbiddenException('No autorizado para crear esta licencia');
      }
      idEntrepreneurs = user.id;
    }

    if (!documentFile) throw new BadRequestException('Adjuntá el documento de la matrícula');

    const entrepreneur = await this.prisma.entrepreneurs.findUnique({ where: { id: idEntrepreneurs } });
    if (!entrepreneur) throw new NotFoundException('Emprendedor no encontrado');

    const licenseType = await this.prisma.license_Types.findUnique({ where: { id: dto.idLicenseTypes } });
    if (!licenseType) throw new NotFoundException('Tipo de licencia no encontrado');

    const duplicate = await this.prisma.entrepreneur_Licenses.findFirst({
      where: { idEntrepreneurs, idLicenseTypes: dto.idLicenseTypes },
    });
    if (duplicate) {
      throw new ConflictException('Ya cargaste esta matrícula. Si querés renovarla, reemplazá el documento.');
    }

    const issueDate = dto.issueDate ? new Date(dto.issueDate) : null;
    const expirationDate = dto.expirationDate ? new Date(dto.expirationDate) : null;
    this.assertDates(issueDate, expirationDate, true);

    const documentUrl = await this.cloudinary.uploadDocument(documentFile, 'aurabox/licenses');

    const created = await this.prisma.entrepreneur_Licenses.create({
      data: {
        idEntrepreneurs,
        idLicenseTypes: dto.idLicenseTypes,
        issueDate,
        expirationDate,
        documentUrl,
        verificationStatus: VerificationStatus.PENDIENTE,
      },
    });
    return sanitize(created);
  }

  async adminList(status?: string) {
    const validStatus = Object.values(VerificationStatus).includes(status as VerificationStatus)
      ? (status as VerificationStatus)
      : undefined;

    const licenses = await this.prisma.entrepreneur_Licenses.findMany({
      where: validStatus ? { verificationStatus: validStatus } : {},
      orderBy: { id: 'asc' },
      take: 300,
    });

    const entrepreneurIds = Array.from(new Set(licenses.map((row) => row.idEntrepreneurs)));
    const typeIds = Array.from(new Set(licenses.map((row) => row.idLicenseTypes)));

    const [entrepreneurs, types, links] = await Promise.all([
      this.prisma.entrepreneurs.findMany({
        where: { id: { in: entrepreneurIds } },
        select: { id: true, firstName: true, lastName: true, email: true },
      }),
      this.prisma.license_Types.findMany({ where: { id: { in: typeIds } }, select: { id: true, name: true } }),
      this.prisma.entrepreneur_Club.findMany({ where: { idEntrepreneurs: { in: entrepreneurIds } } }),
    ]);

    const clubs = await this.prisma.club.findMany({
      where: { id: { in: Array.from(new Set(links.map((row) => row.idClub))) } },
      select: { id: true, name: true, clubStatus: true },
    });

    const now = Date.now();

    return licenses.map((license) => {
      const entrepreneur = entrepreneurs.find((row) => row.id === license.idEntrepreneurs);
      const type = types.find((row) => row.id === license.idLicenseTypes);
      const entrepreneurClubs = links
        .filter((row) => row.idEntrepreneurs === license.idEntrepreneurs)
        .map((row) => clubs.find((club) => club.id === row.idClub))
        .filter((club): club is NonNullable<typeof club> => !!club);

      return {
        id: license.id,
        verificationStatus: license.verificationStatus,
        hasDocument: Boolean(license.documentUrl),
        issueDate: license.issueDate ? license.issueDate.toISOString() : null,
        expirationDate: license.expirationDate ? license.expirationDate.toISOString() : null,
        verificationDate: license.verificationDate ? license.verificationDate.toISOString() : null,
        verificationNotes: license.verificationNotes,
        daysToExpire: license.expirationDate
          ? Math.ceil((license.expirationDate.getTime() - now) / DAY_MS)
          : null,
        licenseType: type?.name ?? `Tipo #${license.idLicenseTypes}`,
        entrepreneur: entrepreneur
          ? { id: entrepreneur.id, name: `${entrepreneur.firstName} ${entrepreneur.lastName}`, email: entrepreneur.email }
          : null,
        clubs: entrepreneurClubs,
      };
    });
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

  async getDocument(id: number, user: RequestUser) {
    const license = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
    if (!license) throw new NotFoundException('Licencia no encontrada');
    if (user.role !== 'admin' && license.idEntrepreneurs !== user.id) {
      throw new ForbiddenException('No autorizado para ver este documento');
    }
    if (!license.documentUrl) throw new NotFoundException('La licencia no tiene documento');
    return this.cloudinary.fetchDocument(license.documentUrl);
  }

  async update(id: number, dto: UpdateEntrepreneurLicenseDto, user: RequestUser, documentFile?: Express.Multer.File) {
    const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Licencia no encontrada');
    if (existing.idEntrepreneurs !== user.id) {
      throw new ForbiddenException('No autorizado para actualizar esta licencia');
    }

    if (!documentFile && dto.issueDate === undefined && dto.expirationDate === undefined) {
      throw new BadRequestException('No hay cambios para guardar');
    }

    const issueDate = dto.issueDate ? new Date(dto.issueDate) : existing.issueDate;
    const expirationDate = dto.expirationDate ? new Date(dto.expirationDate) : existing.expirationDate;
    this.assertDates(issueDate, expirationDate, dto.expirationDate !== undefined);

    let documentUrl = existing.documentUrl;
    if (documentFile) {
      const newUrl = await this.cloudinary.uploadDocument(documentFile, 'aurabox/licenses');
      if (existing.documentUrl) {
        try {
          await this.cloudinary.deleteDocument(existing.documentUrl);
        } catch (error) {
          this.logger.warn(`No se pudo borrar el documento anterior de la licencia ${id}: ${(error as Error).message}`);
        }
      }
      documentUrl = newUrl;
    }

    const updated = await this.prisma.entrepreneur_Licenses.update({
      where: { id },
      data: {
        issueDate,
        expirationDate,
        documentUrl,
        verificationStatus: VerificationStatus.PENDIENTE,
        verificationDate: null,
        verificationNotes: null,
      },
    });
    return sanitize(updated);
  }

  async verify(id: number, dto: VerifyLicenseDto) {
    const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Licencia no encontrada');
    if (!existing.documentUrl) throw new BadRequestException('La licencia no tiene documento para revisar');

    const notes = dto.verificationNotes?.trim() || null;
    if (dto.verificationStatus === 'RECHAZADO' && !notes) {
      throw new BadRequestException('Indicá el motivo del rechazo');
    }

    const updated = await this.prisma.entrepreneur_Licenses.update({
      where: { id },
      data: {
        verificationStatus: dto.verificationStatus as VerificationStatus,
        verificationDate: new Date(),
        verificationNotes: notes,
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

    const { items } = await getLicenseRequirements(this.prisma, idClub);
    return items.map((item) => ({
      idLicenseTypes: item.idLicenseTypes,
      name: item.name,
      description: item.description,
      entrepreneurLicenseId: item.entrepreneurLicenseId,
      verificationStatus: item.verificationStatus,
      hasDocument: Boolean(item.documentUrl),
      issueDate: item.issueDate,
      expirationDate: item.expirationDate,
      verificationNotes: item.verificationNotes,
    }));
  }

  async getMyCompliance(user: RequestUser) {
    const association = await this.prisma.entrepreneur_Club.findFirst({
      where: { idEntrepreneurs: user.id },
      orderBy: { associationDate: 'asc' },
    });
    if (!association) return { hasClub: false };

    const club = await this.prisma.club.findUnique({
      where: { id: association.idClub },
      select: { id: true, name: true, clubStatus: true },
    });
    if (!club) return { hasClub: false };

    const lastChange = await this.prisma.club_Status_History.findFirst({
      where: { idClub: club.id },
      orderBy: { changeDate: 'desc' },
    });

    const { idEntrepreneur, items } = await getLicenseRequirements(this.prisma, club.id);
    const summary = summarizeRequirements(items);

    return {
      hasClub: true,
      isOwner: idEntrepreneur === user.id,
      club,
      statusReason: lastChange?.changeReason ?? null,
      statusChangedAt: lastChange ? lastChange.changeDate.toISOString() : null,
      requirements: items.map(({ documentUrl, ...rest }) => ({ ...rest, hasDocument: Boolean(documentUrl) })),
      summary,
    };
  }

  async remove(id: number) {
    const existing = await this.prisma.entrepreneur_Licenses.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Licencia no encontrada');
    if (existing.documentUrl) {
      try {
        await this.cloudinary.deleteDocument(existing.documentUrl);
      } catch (error) {
        this.logger.warn(`No se pudo borrar el documento de la licencia ${id}: ${(error as Error).message}`);
      }
    }
    await this.prisma.entrepreneur_Licenses.delete({ where: { id } });
    return { message: 'Licencia eliminada correctamente' };
  }
}