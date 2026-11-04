import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  private async assertVersionFree(ruleType: string, version: string, excludeId?: number) {
    const duplicate = await this.prisma.platform_Rules.findFirst({
      where: { ruleType, version, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (duplicate) {
      throw new BadRequestException(`Ya existe la versión ${version} para este tipo de regla`);
    }
  }

  async create(dto: CreatePlatformRuleDto) {
    const ruleType = dto.ruleType.trim();
    const version = dto.version.trim();
    await this.assertVersionFree(ruleType, version);

    const created = await this.prisma.platform_Rules.create({
      data: {
        title: dto.title.trim(),
        content: dto.content.trim(),
        version,
        ruleType,
        active: false,
        publicationDate: new Date(),
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
      orderBy: { ruleType: 'asc' },
    });
    return rules.map((rule) =>
      sanitize({
        id: rule.id,
        title: rule.title,
        content: rule.content,
        version: rule.version,
        ruleType: rule.ruleType,
        publicationDate: rule.publicationDate,
      }),
    );
  }

  async findOne(id: number) {
    const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Regla de plataforma no encontrada');
    return sanitize(item);
  }

  async update(id: number, dto: UpdatePlatformRuleDto) {
    const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Regla de plataforma no encontrada');
    if (item.active) {
      throw new BadRequestException('Una regla publicada no se puede editar. Creá una nueva versión.');
    }

    const ruleType = dto.ruleType !== undefined ? dto.ruleType.trim() : item.ruleType;
    const version = dto.version !== undefined ? dto.version.trim() : item.version;
    if (ruleType !== item.ruleType || version !== item.version) {
      await this.assertVersionFree(ruleType, version, id);
    }

    const updated = await this.prisma.platform_Rules.update({
      where: { id },
      data: {
        ruleType,
        version,
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.content !== undefined ? { content: dto.content.trim() } : {}),
      },
    });
    return sanitize(updated);
  }

  async setActive(id: number, active: boolean) {
    const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Regla de plataforma no encontrada');
    if (item.active === active) return sanitize(item);

    if (!active) {
      const updated = await this.prisma.platform_Rules.update({ where: { id }, data: { active: false } });
      return sanitize(updated);
    }

    const [, published] = await this.prisma.$transaction([
      this.prisma.platform_Rules.updateMany({
        where: { ruleType: item.ruleType, active: true, id: { not: id } },
        data: { active: false },
      }),
      this.prisma.platform_Rules.update({
        where: { id },
        data: { active: true, publicationDate: new Date() },
      }),
    ]);
    return sanitize(published);
  }

  async remove(id: number) {
    const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Regla de plataforma no encontrada');
    if (item.active) {
      throw new BadRequestException('No se puede eliminar una regla publicada. Despublicala primero.');
    }
    await this.prisma.platform_Rules.delete({ where: { id } });
    return { message: 'Regla eliminada correctamente' };
  }
}