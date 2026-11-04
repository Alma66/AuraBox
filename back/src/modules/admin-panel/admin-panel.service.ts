import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClubStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangeClubStatusDto } from './dto/change-club-status.dto';
import { SetReviewVisibilityDto } from './dto/set-review-visibility.dto';

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const ACCOUNT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  active: true,
  registrationDate: true,
};

@Injectable()
export class AdminPanelService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [clubsByStatus, customers, entrepreneurs, activeSubscriptions, reviews, totals, payments, pendingClubs] =
      await Promise.all([
        this.prisma.club.groupBy({ by: ['clubStatus'], _count: { _all: true } }),
        this.prisma.user.count(),
        this.prisma.entrepreneurs.count(),
        this.prisma.user_Subscriptions.count({ where: { subscriptionStatus: 'Activa' } }),
        this.prisma.reviews.count(),
        this.prisma.payment.aggregate({
          where: { paymentStatus: 'Exitoso' },
          _sum: { totalAmountPaid: true, commissionAmount: true },
        }),
        this.prisma.payment.findMany({
          where: { paymentStatus: 'Exitoso', paymentDate: { gte: since } },
          select: { paymentDate: true, totalAmountPaid: true, commissionAmount: true },
        }),
        this.prisma.club.findMany({
          where: { clubStatus: 'PENDIENTE_APROBACION' },
          orderBy: { creationDate: 'asc' },
          take: 5,
          select: { id: true, name: true, creationDate: true },
        }),
      ]);

    const countOf = (status: ClubStatus) =>
      clubsByStatus.find((row) => row.clubStatus === status)?._count._all ?? 0;

    const monthly: { month: string; total: number; commission: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      monthly.push({ month: monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)), total: 0, commission: 0 });
    }
    payments.forEach((payment) => {
      const row = monthly.find((item) => item.month === monthKey(payment.paymentDate));
      if (row) {
        row.total += Number(payment.totalAmountPaid);
        row.commission += Number(payment.commissionAmount);
      }
    });

    return {
      clubs: {
        total: clubsByStatus.reduce((sum, row) => sum + row._count._all, 0),
        pending: countOf('PENDIENTE_APROBACION'),
        approved: countOf('APROBADO'),
        suspended: countOf('SUSPENDIDO'),
        inactive: countOf('INACTIVO'),
      },
      customers,
      entrepreneurs,
      activeSubscriptions,
      reviews,
      revenue: {
        total: Number(totals._sum.totalAmountPaid ?? 0),
        commission: Number(totals._sum.commissionAmount ?? 0),
      },
      monthly,
      pendingClubs: pendingClubs.map((club) => ({
        id: club.id,
        name: club.name,
        creationDate: club.creationDate.toISOString(),
      })),
    };
  }

  async findClubs(status?: string) {
    const validStatus = Object.values(ClubStatus).includes(status as ClubStatus) ? (status as ClubStatus) : undefined;
    const clubs = await this.prisma.club.findMany({
      where: validStatus ? { clubStatus: validStatus } : {},
      orderBy: { creationDate: 'desc' },
    });

    const links = await this.prisma.entrepreneur_Club.findMany({
      where: { idClub: { in: clubs.map((club) => club.id) } },
    });
    const owners = await this.prisma.entrepreneurs.findMany({
      where: { id: { in: links.map((link) => link.idEntrepreneurs) } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const ownerById = new Map(owners.map((owner) => [owner.id, owner] as [number, typeof owner]));

    return clubs.map((club) => {
      const link = links.find((item) => item.idClub === club.id);
      return {
        id: club.id,
        name: club.name,
        logoUrl: club.logoUrl,
        shortDescription: club.shortDescription,
        contactEmail: club.contactEmail,
        clubStatus: club.clubStatus,
        creationDate: club.creationDate.toISOString(),
        averageRating: club.averageRating ? Number(club.averageRating) : null,
        totalReviews: club.totalReviews,
        owner: link ? ownerById.get(link.idEntrepreneurs) ?? null : null,
      };
    });
  }

  async changeClubStatus(clubId: number, adminId: number, dto: ChangeClubStatusDto) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club no encontrado');
    if (club.clubStatus === dto.status) throw new BadRequestException('El club ya tiene ese estado');

    const reason = dto.reason?.trim() || null;
    const needsReason = dto.status === 'SUSPENDIDO' || dto.status === 'INACTIVO';
    if (needsReason && !reason) throw new BadRequestException('Indicá el motivo del cambio');

    const [updated] = await this.prisma.$transaction([
      this.prisma.club.update({ where: { id: clubId }, data: { clubStatus: dto.status } }),
      this.prisma.club_Status_History.create({
        data: {
          idClub: clubId,
          idAdmins: adminId,
          previousStatus: club.clubStatus,
          newStatus: dto.status,
          changeReason: reason,
        },
      }),
    ]);

    return { id: updated.id, clubStatus: updated.clubStatus };
  }

  async findClubStatusHistory(clubId: number) {
    const history = await this.prisma.club_Status_History.findMany({
      where: { idClub: clubId },
      orderBy: { changeDate: 'desc' },
    });
    const admins = await this.prisma.admins.findMany({
      where: { id: { in: Array.from(new Set(history.map((entry) => entry.idAdmins))) } },
      select: { id: true, firstName: true, lastName: true },
    });
    const nameById = new Map(admins.map((admin) => [admin.id, `${admin.firstName} ${admin.lastName}`] as [number, string]));

    return history.map((entry) => ({
      id: entry.id,
      previousStatus: entry.previousStatus,
      newStatus: entry.newStatus,
      changeReason: entry.changeReason,
      changeDate: entry.changeDate.toISOString(),
      admin: nameById.get(entry.idAdmins) ?? null,
    }));
  }

  async findAccounts(type: string, search?: string) {
    if (type !== 'customer' && type !== 'entrepreneur') {
      throw new BadRequestException('Tipo de cuenta inválido');
    }

    const term = search?.trim();
    const where = term
      ? {
          OR: [
            { firstName: { contains: term, mode: 'insensitive' as const } },
            { lastName: { contains: term, mode: 'insensitive' as const } },
            { email: { contains: term, mode: 'insensitive' as const } },
          ],
        }
      : {};

    if (type === 'customer') {
      const users = await this.prisma.user.findMany({
        where,
        orderBy: { registrationDate: 'desc' },
        take: 200,
        select: ACCOUNT_SELECT,
      });
      return users.map((user) => ({
        ...user,
        registrationDate: user.registrationDate.toISOString(),
        club: null,
      }));
    }

    const entrepreneurs = await this.prisma.entrepreneurs.findMany({
      where,
      orderBy: { registrationDate: 'desc' },
      take: 200,
      select: ACCOUNT_SELECT,
    });
    const links = await this.prisma.entrepreneur_Club.findMany({
      where: { idEntrepreneurs: { in: entrepreneurs.map((item) => item.id) } },
    });
    const clubs = await this.prisma.club.findMany({
      where: { id: { in: links.map((link) => link.idClub) } },
      select: { id: true, name: true, clubStatus: true },
    });
    const clubById = new Map(clubs.map((club) => [club.id, club] as [number, typeof club]));

    return entrepreneurs.map((item) => {
      const link = links.find((entry) => entry.idEntrepreneurs === item.id);
      return {
        ...item,
        registrationDate: item.registrationDate.toISOString(),
        club: link ? clubById.get(link.idClub) ?? null : null,
      };
    });
  }

  async setAccountActive(type: string, id: number, active: boolean) {
    if (type !== 'customer' && type !== 'entrepreneur') {
      throw new BadRequestException('Tipo de cuenta inválido');
    }

    const result =
      type === 'customer'
        ? await this.prisma.user.updateMany({ where: { id }, data: { active } })
        : await this.prisma.entrepreneurs.updateMany({ where: { id }, data: { active } });

    if (result.count === 0) throw new NotFoundException('Cuenta no encontrada');
    return { id, active };
  }

    async findPayments(clubIdRaw?: string, month?: string) {
    const where: Prisma.PaymentWhereInput = {};

    if (clubIdRaw) {
      const clubId = Number(clubIdRaw);
      if (!Number.isInteger(clubId) || clubId <= 0) throw new BadRequestException('Club inválido');
      where.idClub = clubId;
    }

    if (month) {
      const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
      if (!match) throw new BadRequestException('Mes inválido');
      const year = Number(match[1]);
      const monthIndex = Number(match[2]) - 1;
      where.paymentDate = {
        gte: new Date(year, monthIndex, 1),
        lt: new Date(year, monthIndex + 1, 1),
      };
    }

    const successful: Prisma.PaymentWhereInput = { ...where, paymentStatus: 'Exitoso' };

    const [rows, totalRows, totals, perClub] = await Promise.all([
      this.prisma.payment.findMany({ where, orderBy: { paymentDate: 'desc' }, take: 200 }),
      this.prisma.payment.count({ where }),
      this.prisma.payment.aggregate({
        where: successful,
        _sum: { totalAmountPaid: true, clubAmount: true, commissionAmount: true },
        _count: { _all: true },
      }),
      this.prisma.payment.groupBy({
        by: ['idClub'],
        where: successful,
        _sum: { totalAmountPaid: true, clubAmount: true, commissionAmount: true },
        _count: { _all: true },
      }),
    ]);

    const clubIds = Array.from(new Set([...rows.map((row) => row.idClub), ...perClub.map((row) => row.idClub)]));
    const userIds = Array.from(new Set(rows.map((row) => row.idUser)));
    const methodIds = Array.from(
      new Set(rows.map((row) => row.idPaymentMethods).filter((id): id is number => typeof id === 'number')),
    );

    const [clubs, users, methods] = await Promise.all([
      this.prisma.club.findMany({ where: { id: { in: clubIds } }, select: { id: true, name: true } }),
      this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true } }),
      this.prisma.payment_Methods.findMany({ where: { id: { in: methodIds } }, select: { id: true, method: true } }),
    ]);

    const clubById = new Map(clubs.map((club) => [club.id, club.name] as [number, string]));
    const userById = new Map(users.map((user) => [user.id, `${user.firstName} ${user.lastName}`] as [number, string]));
    const methodById = new Map(methods.map((item) => [item.id, item.method] as [number, string]));

    return {
      totals: {
        count: totals._count._all,
        total: Number(totals._sum.totalAmountPaid ?? 0),
        clubAmount: Number(totals._sum.clubAmount ?? 0),
        commission: Number(totals._sum.commissionAmount ?? 0),
      },
      perClub: perClub
        .map((row) => ({
          idClub: row.idClub,
          club: clubById.get(row.idClub) ?? `Club #${row.idClub}`,
          count: row._count._all,
          total: Number(row._sum.totalAmountPaid ?? 0),
          clubAmount: Number(row._sum.clubAmount ?? 0),
          commission: Number(row._sum.commissionAmount ?? 0),
        }))
        .sort((a, b) => b.total - a.total),
      payments: rows.map((row) => ({
        id: row.id,
        paymentDate: row.paymentDate.toISOString(),
        paymentStatus: row.paymentStatus,
        total: Number(row.totalAmountPaid ?? 0),
        clubAmount: Number(row.clubAmount ?? 0),
        commission: Number(row.commissionAmount ?? 0),
        club: clubById.get(row.idClub) ?? `Club #${row.idClub}`,
        customer: userById.get(row.idUser) ?? null,
        method: row.idPaymentMethods ? methodById.get(row.idPaymentMethods) ?? null : null,
        gatewayTransaction: row.idGatewayTransaction ?? null,
      })),
      truncated: totalRows > rows.length,
    };
  }
  
  async findReviews(filter?: string) {
    const reviews = await this.prisma.reviews.findMany({
      where: filter === 'hidden' ? { isHidden: true } : {},
      orderBy: { reviewDate: 'desc' },
      take: 200,
      include: { media: true },
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(new Set(reviews.map((review) => review.idUser))) } },
      select: { id: true, firstName: true, lastName: true },
    });
    const clubs = await this.prisma.club.findMany({
      where: { id: { in: Array.from(new Set(reviews.map((review) => review.idClub))) } },
      select: { id: true, name: true },
    });
    const userById = new Map(users.map((user) => [user.id, `${user.firstName} ${user.lastName}`] as [number, string]));
    const clubById = new Map(clubs.map((club) => [club.id, club.name] as [number, string]));

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      reviewDate: review.reviewDate.toISOString(),
      isHidden: review.isHidden,
      hiddenReason: review.hiddenReason,
      mediaCount: review.media.length,
      customer: userById.get(review.idUser) ?? null,
      club: clubById.get(review.idClub) ?? null,
    }));
  }

  async setReviewVisibility(id: number, dto: SetReviewVisibilityDto) {
    const reason = dto.reason?.trim() || null;
    if (dto.isHidden && !reason) throw new BadRequestException('Indicá el motivo para ocultar la reseña');

    const result = await this.prisma.reviews.updateMany({
      where: { id },
      data: { isHidden: dto.isHidden, hiddenReason: dto.isHidden ? reason : null },
    });

    if (result.count === 0) throw new NotFoundException('Reseña no encontrada');
    return { id, isHidden: dto.isHidden };
  }
}