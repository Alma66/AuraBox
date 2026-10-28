try {
  require('dotenv').config();
} catch (e) {}
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const [email, password, firstName, lastName, documentNumber] = process.argv.slice(2);
  if (!email || !password || !firstName || !lastName || !documentNumber) {
    console.log('Uso: node scripts/create-admin.js email password nombre apellido dni');
    return;
  }
  const exists = await prisma.admins.findUnique({ where: { email } });
  if (exists) {
    console.log('Ya existe un admin con ese email');
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admins.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      documentType: 'DNI',
      documentNumber: parseInt(documentNumber, 10),
    },
  });
  console.log('Admin creado con id', admin.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());