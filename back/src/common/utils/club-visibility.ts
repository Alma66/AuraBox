import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type OptionalRequestUser = { id: number; role: string } | null | undefined;

export async function canViewClub(
  prisma: PrismaService,
  idClub: number,
  user: OptionalRequestUser,
): Promise<boolean> {
  const club = await prisma.club.findUnique({ where: { id: idClub }, select: { clubStatus: true } });
  if (!club) return false;
  if (club.clubStatus === 'APROBADO') return true;
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'entrepreneur') {
    const assoc = await prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    return !!assoc;
  }
  return false;
}

export async function assertClubVisible(
  prisma: PrismaService,
  idClub: number,
  user: OptionalRequestUser,
) {
  const visible = await canViewClub(prisma, idClub, user);
  if (!visible) throw new NotFoundException('Club no encontrado');
}