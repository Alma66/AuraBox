import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const EXPIRING_SOON_DAYS = 30;

export type RequirementState = 'FALTANTE' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'VENCIDA';

export const REQUIREMENT_STATE_LABELS: Record<RequirementState, string> = {
  FALTANTE: 'sin presentar',
  PENDIENTE: 'en revisión',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
  VENCIDA: 'vencida',
};

export interface LicenseRequirement {
  idLicenseTypes: number;
  name: string;
  description: string | null;
  entrepreneurLicenseId: number | null;
  verificationStatus: VerificationStatus | null;
  state: RequirementState;
  documentUrl: string | null;
  issueDate: string | null;
  expirationDate: string | null;
  verificationNotes: string | null;
  verificationDate: string | null;
  daysToExpire: number | null;
  expiringSoon: boolean;
  valid: boolean;
}

export interface RequirementsSummary {
  required: number;
  approved: number;
  pending: number;
  rejected: number;
  missing: number;
  expired: number;
  expiringSoon: number;
  allValid: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function summarizeRequirements(items: LicenseRequirement[]): RequirementsSummary {
  const count = (state: RequirementState) => items.filter((item) => item.state === state).length;
  return {
    required: items.length,
    approved: count('APROBADA'),
    pending: count('PENDIENTE'),
    rejected: count('RECHAZADA'),
    missing: count('FALTANTE'),
    expired: count('VENCIDA'),
    expiringSoon: items.filter((item) => item.expiringSoon).length,
    allValid: items.every((item) => item.valid),
  };
}

export async function getLicenseRequirements(prisma: PrismaService, idClub: number) {
  const owner = await prisma.entrepreneur_Club.findFirst({
    where: { idClub },
    orderBy: { associationDate: 'asc' },
  });

  const clubCategories = await prisma.club_Categories.findMany({ where: { idClub } });
  const categoryIds = clubCategories.map((row) => row.idCategories);

  const links = categoryIds.length > 0
    ? await prisma.category_License_Type.findMany({ where: { idCategories: { in: categoryIds } } })
    : [];
  const typeIds = Array.from(new Set(links.map((link) => link.idLicenseTypes)));

  const types = typeIds.length > 0
    ? await prisma.license_Types.findMany({ where: { id: { in: typeIds } }, orderBy: { name: 'asc' } })
    : [];

  const uploaded = owner && typeIds.length > 0
    ? await prisma.entrepreneur_Licenses.findMany({
        where: { idEntrepreneurs: owner.idEntrepreneurs, idLicenseTypes: { in: typeIds } },
      })
    : [];

  const now = new Date();

  const items: LicenseRequirement[] = types.map((type) => {
    const license = uploaded.find((row) => row.idLicenseTypes === type.id);

    let state: RequirementState = 'FALTANTE';
    let daysToExpire: number | null = null;

    if (license) {
      const expired = !!license.expirationDate && license.expirationDate.getTime() < now.getTime();
      if (license.expirationDate) {
        daysToExpire = Math.ceil((license.expirationDate.getTime() - now.getTime()) / DAY_MS);
      }
      if (license.verificationStatus === 'PENDIENTE') state = 'PENDIENTE';
      else if (license.verificationStatus === 'RECHAZADO') state = 'RECHAZADA';
      else state = expired ? 'VENCIDA' : 'APROBADA';
    }

    return {
      idLicenseTypes: type.id,
      name: type.name,
      description: type.description,
      entrepreneurLicenseId: license?.id ?? null,
      verificationStatus: license?.verificationStatus ?? null,
      state,
      documentUrl: license?.documentUrl ?? null,
      issueDate: license?.issueDate ? license.issueDate.toISOString() : null,
      expirationDate: license?.expirationDate ? license.expirationDate.toISOString() : null,
      verificationNotes: license?.verificationNotes ?? null,
      verificationDate: license?.verificationDate ? license.verificationDate.toISOString() : null,
      daysToExpire,
      expiringSoon: state === 'APROBADA' && daysToExpire !== null && daysToExpire <= EXPIRING_SOON_DAYS,
      valid: state === 'APROBADA',
    };
  });

  return { idEntrepreneur: owner?.idEntrepreneurs ?? null, items };
}