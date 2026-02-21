import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  await prisma.admins.upsert({
    where: { email: 'adminTest@example.com' },
    update: {},
    create: {
      email: 'adminTest@example.com',
      passwordHash: password,
      firstName: 'Admin',
      lastName: 'AuraBox',
      documentType: 'DNI',
      documentNumber: 12345678,
      phoneNumber: 123456789,
      active: true,
    },
  });

  await prisma.entrepreneurs.upsert({
    where: { email: 'emprendedorTest@example.com' },
    update: {},
    create: {
      email: 'emprendedorTest@example.com',
      passwordHash: password,
      firstName: 'Juan',
      lastName: 'Pérez',
      documentType: 'DNI',
      documentNumber: 23456789,
      phoneNumber: 234567890,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'clienteTest@example.com' },
    update: {},
    create: {
      email: 'clienteTest@example.com',
      passwordHash: password,
      firstName: 'María',
      lastName: 'Gómez',
      documentType: 'DNI',
      documentNumber: 34567890,
      phoneNumber: 345678901,
      active: true,
    },
  });

  console.log('✅ Seed completado');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());