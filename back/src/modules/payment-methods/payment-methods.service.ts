import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentMethodDto) {
    const exists = await this.prisma.payment_Methods.findUnique({ where: { method: dto.method } });
    if (exists) throw new ConflictException('Ya existe un método de pago con ese nombre');

    return this.prisma.payment_Methods.create({
      data: {
        method: dto.method,
        active: dto.active ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.payment_Methods.findMany({ orderBy: { id: 'desc' } });
  }

  async findActive() {
    return this.prisma.payment_Methods.findMany({
      where: { active: true },
      orderBy: { id: 'desc' },
    });
  }

  async findByMethod(method: string) {
    return this.prisma.payment_Methods.findUnique({ where: { method } });
  }

  async findOne(id: number) {
    const item = await this.prisma.payment_Methods.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Método de pago no encontrado');
    return item;
  }

  async update(id: number, dto: UpdatePaymentMethodDto) {
    const item = await this.prisma.payment_Methods.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Método de pago no encontrado');

    if (dto.method && dto.method !== item.method) {
      const dup = await this.prisma.payment_Methods.findUnique({ where: { method: dto.method } });
      if (dup) throw new ConflictException('Ya existe otro método de pago con ese nombre');
    }

    return this.prisma.payment_Methods.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: number) {
    const item = await this.prisma.payment_Methods.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Método de pago no encontrado');
    await this.prisma.payment_Methods.delete({ where: { id } });
    return { message: 'Método de pago eliminado correctamente' };
  }
}