import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserCategoryPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(idUser: number) {
    const prefs = await this.prisma.user_Category_Preference.findMany({ where: { idUser } });
    const categoryIds = prefs.map((p) => p.idCategory);
    if (categoryIds.length === 0) return [];
    return this.prisma.categories.findMany({ where: { id: { in: categoryIds } } });
  }

  async replace(idUser: number, categoryIds: number[]) {
    const uniqueIds = Array.from(new Set(categoryIds));
    if (uniqueIds.length > 0) {
      const found = await this.prisma.categories.findMany({ where: { id: { in: uniqueIds } } });
      if (found.length !== uniqueIds.length) {
        throw new BadRequestException('Alguna categoría no existe');
      }
    }
    await this.prisma.user_Category_Preference.deleteMany({ where: { idUser } });
    if (uniqueIds.length > 0) {
      await this.prisma.user_Category_Preference.createMany({
        data: uniqueIds.map((idCategory) => ({ idUser, idCategory })),
      });
    }
    return this.findByUser(idUser);
  }
}