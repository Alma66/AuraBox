import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlatformRuleDto } from './dto/create-platform-rule.dto';
import { UpdatePlatformRuleDto } from './dto/update-platform-rule.dto';

function sanitize(rule: any) {
  if (!rule) return rule;
  if (rule.publicationDate instanceof Date) rule.publicationDate = rule.publicationDate.toISOString();
  return rule;
}

@Injectable()
export class PlatformRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlatformRuleDto) {
    const created = await this.prisma.platform_Rules.create({
      data: {
        title: dto.title,
        content: dto.content,
        version: dto.version,
        publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : new Date(),
        active: dto.active ?? true,
        ruleType: dto.ruleType,
      },
    });
    return sanitize(created);
  }

  async findAll() {
    const rules = await this.prisma.platform_Rules.findMany({ orderBy: { publicationDate: 'desc' } });
    return rules.map(sanitize);
  }

  async findActive() {
    const rules = await this.prisma.platform_Rules.findMany({
      where: { active: true },
      orderBy: { publicationDate: 'desc' },
    });
    return rules.map(sanitize);
  }

  async findOne(id: number) {
    const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Regla de plataforma no encontrada');
    return sanitize(item);
  }

  async update(id: number, dto: UpdatePlatformRuleDto) {
    const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Regla de plataforma no encontrada');

    const updated = await this.prisma.platform_Rules.update({
      where: { id },
      data: {
        ...dto,
        publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : item.publicationDate,
      },
    });
    return sanitize(updated);
  }

  async remove(id: number) {
    const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Regla de plataforma no encontrada');
    await this.prisma.platform_Rules.delete({ where: { id } });
    return { message: 'Regla eliminada correctamente' };
  }
}