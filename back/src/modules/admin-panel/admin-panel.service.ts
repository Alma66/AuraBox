import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClubStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangeClubStatusDto } from './dto/change-club-status.dto';

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

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
}