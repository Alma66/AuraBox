import { PrismaService } from '../../prisma/prisma.service';
import {
  PAYMENT_METHOD_CODES,
  PAYMENT_METHOD_DEFAULT_NAMES,
  PAYMENT_METHOD_KEYWORDS,
  PaymentMethodCode,
  codeFromMethodName,
} from '../../modules/payments/payments.constants';

export const findOrCreateMethod = async (prisma: PrismaService, code: PaymentMethodCode) => {
  const found = await prisma.payment_Methods.findFirst({
    where: { method: { contains: PAYMENT_METHOD_KEYWORDS[code], mode: 'insensitive' }, active: true },
    orderBy: { id: 'asc' },
  });
  if (found) return found;
  const name = PAYMENT_METHOD_DEFAULT_NAMES[code];
  return prisma.payment_Methods.upsert({
    where: { method: name },
    update: { active: true },
    create: { method: name, active: true },
  });
};

export const getAcceptedCodes = async (prisma: PrismaService, clubId: number): Promise<PaymentMethodCode[]> => {
  const links = await prisma.club_Payment_Method.findMany({ where: { idClub: clubId } });
  if (links.length === 0) return [...PAYMENT_METHOD_CODES];

  const methods = await prisma.payment_Methods.findMany({
    where: { id: { in: links.map((link) => link.idPaymentMethod) }, active: true },
  });
  const codes = new Set<PaymentMethodCode>();
  methods.forEach((method) => {
    const code = codeFromMethodName(method.method);
    if (code) codes.add(code);
  });
  if (codes.size === 0) return [...PAYMENT_METHOD_CODES];
  return PAYMENT_METHOD_CODES.filter((code) => codes.has(code));
};

export const saveAcceptedCodes = async (prisma: PrismaService, clubId: number, codes: PaymentMethodCode[]) => {
  const ids: number[] = [];
  for (const code of codes) {
    const method = await findOrCreateMethod(prisma, code);
    ids.push(method.id);
  }

  const links = await prisma.club_Payment_Method.findMany({ where: { idClub: clubId } });
  const methods =
    links.length > 0
      ? await prisma.payment_Methods.findMany({ where: { id: { in: links.map((link) => link.idPaymentMethod) } } })
      : [];
  const methodById = new Map(methods.map((method) => [method.id, method] as [number, typeof method]));
  const managedLinkIds = links
    .filter((link) => {
      const method = methodById.get(link.idPaymentMethod);
      return method ? codeFromMethodName(method.method) !== null : false;
    })
    .map((link) => link.id);

  await prisma.$transaction([
    prisma.club_Payment_Method.deleteMany({ where: { id: { in: managedLinkIds } } }),
    prisma.club_Payment_Method.createMany({
      data: Array.from(new Set(ids)).map((id) => ({ idClub: clubId, idPaymentMethod: id })),
    }),
  ]);
};