import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

type SlotType = 'image' | 'text';

interface SlotDefinition {
  type: SlotType;
  label: string;
  hint: string;
  maxLength?: number;
}

export const SITE_CONTENT_SLOTS: Record<string, SlotDefinition> = {
  hero_image: {
    type: 'image',
    label: 'Imagen principal del inicio',
    hint: 'Fondo grande de la portada. Mejor una foto horizontal y luminosa.',
  },
  hero_title: {
    type: 'text',
    label: 'Título de la portada',
    hint: 'La frase grande que se ve al entrar al sitio.',
    maxLength: 120,
  },
  hero_subtitle: {
    type: 'text',
    label: 'Subtítulo de la portada',
    hint: 'Una línea corta debajo del título.',
    maxLength: 200,
  },
  home_image_1: {
    type: 'image',
    label: 'Imagen "Experiencias curadas"',
    hint: 'Primera imagen de la sección alternada del inicio.',
  },
  home_image_2: {
    type: 'image',
    label: 'Imagen "Apoyá emprendedores"',
    hint: 'Segunda imagen de la sección alternada del inicio.',
  },
};

const hasSlot = (key: string) => Object.prototype.hasOwnProperty.call(SITE_CONTENT_SLOTS, key);

@Injectable()
export class SiteContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private requireSlot(key: string, expected?: SlotType): SlotDefinition {
    if (!hasSlot(key)) throw new NotFoundException('Ese contenido no existe');
    const definition = SITE_CONTENT_SLOTS[key];
    if (expected && definition.type !== expected) {
      throw new BadRequestException(
        expected === 'image' ? 'Ese campo es un texto, no una imagen' : 'Ese campo es una imagen, no un texto',
      );
    }
    return definition;
  }

  async getPublic() {
    const rows = await this.prisma.site_Content.findMany();
    const result: Record<string, string> = {};
    for (const row of rows) {
      if (hasSlot(row.key)) result[row.key] = row.value;
    }
    return result;
  }

  async listForAdmin() {
    const rows = await this.prisma.site_Content.findMany();
    const byKey = new Map(rows.map((row) => [row.key, row]));
    return Object.entries(SITE_CONTENT_SLOTS).map(([key, definition]) => {
      const row = byKey.get(key);
      return {
        key,
        type: definition.type,
        label: definition.label,
        hint: definition.hint,
        maxLength: definition.maxLength ?? null,
        value: row?.value ?? null,
        updatedAt: row?.updatedAt ?? null,
      };
    });
  }

  private async save(key: string, value: string, adminId: number) {
    const now = new Date();
    await this.prisma.site_Content.upsert({
      where: { key },
      create: { key, value, updatedAt: now, updatedBy: adminId },
      update: { value, updatedAt: now, updatedBy: adminId },
    });
    return { key, value };
  }

  async setText(key: string, value: string, adminId: number) {
    const definition = this.requireSlot(key, 'text');
    if (definition.maxLength && value.length > definition.maxLength) {
      throw new BadRequestException(`El texto no puede superar los ${definition.maxLength} caracteres`);
    }
    return this.save(key, value, adminId);
  }

  async setImage(key: string, file: Express.Multer.File | undefined, adminId: number) {
    this.requireSlot(key, 'image');
    if (!file) throw new BadRequestException('No se recibió ninguna imagen');
    const url = await this.cloudinary.uploadImage(file, 'aurabox/site');
    return this.save(key, url, adminId);
  }

  async reset(key: string) {
    this.requireSlot(key);
    await this.prisma.site_Content.deleteMany({ where: { key } });
    return { key, value: null };
  }
}