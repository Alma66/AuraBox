import { CATCH_WATERMARK } from '@nestjs/common/constants';
import { PrismaClient, AssignedToType, DocumentType, ClubStatus, VerificationStatus, ContentType, Frequency, PaymentStatus, ShipmentStatus, SubscriptionStatus, RoleScope } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {

  console.log('🌱 Iniciando seed...');

const allCategories = await prisma.categories.findMany();
const allLicenseTypes = await prisma.license_Types.findMany();

const licenseByName = new Map(allLicenseTypes.map((l) => [l.name, l.id]));

const UNIVERSAL_LICENSES = [
  'Habilitación Comercial Municipal',
  'Inscripción AFIP / ARCA – CUIT activo',
  'Inscripción Ingresos Brutos (IIBB) – Convenio Multilateral o jurisdicción local',
  'Cumplimiento Ley 24.240 – Defensa del Consumidor (venta online)',
  'Registro de Base de Datos – Ley 25.326 (AAIP)',
];

const CATEGORY_LICENSE_MAP: Record<string, string[]> = {
  'Libros y Lectura': [
    'ISBN – Registro Internacional de Libro (Cámara Argentina del Libro – Ley 25.542)',
    'Cumplimiento Ley 25.542 – Precio Único del Libro',
  ],
  'Vinos': [
    'Inscripción INV – Instituto Nacional de Vitivinicultura',
    'Inscripción Impuestos Internos – Bebidas Alcohólicas (ARCA/AFIP – Ley 24.674)',
    'Declaración de Cumplimiento Ley 24.788 – Lucha contra el Alcoholismo',
  ],
  'Café': [
    'RNE – Registro Nacional de Establecimiento (ANMAT / Autoridad Sanitaria Jurisdiccional)',
    'RNPA – Registro Nacional de Producto Alimentario (ANMAT)',
    'Cumplimiento Código Alimentario Argentino (CAA) – Ley 18.284',
    'Certificado de Buenas Prácticas de Manufactura (BPM) – Res. SENASA 233/98',
    'Etiquetado Nutricional Frontal – Ley 27.642 (sellos de advertencia)',
  ],
  'Cerveza Artesanal': [
    'Inscripción Impuestos Internos – Cervezas (ARCA/AFIP – Ley 24.674)',
    'Inscripción Ley 27.301 – Régimen de Cerveza Artesanal',
    'Habilitación Bromatológica / SENASA para Elaboración de Bebidas Alcohólicas',
    'Declaración de Cumplimiento Ley 24.788 – Lucha contra el Alcoholismo',
  ],
  'Quesos': [
    'Habilitación SENASA – Establecimiento Elaborador de Productos de Origen Animal',
    'Tránsito Federal SENASA – Ciclo II / Ciclo III (productos de origen animal)',
    'RNE – Registro Nacional de Establecimiento (ANMAT / Autoridad Sanitaria Jurisdiccional)',
    'RNPA – Registro Nacional de Producto Alimentario (ANMAT)',
    'Cumplimiento Código Alimentario Argentino (CAA) – Ley 18.284',
    'Certificado de Buenas Prácticas de Manufactura (BPM) – Res. SENASA 233/98',
  ],
  'Embutidos y Charcutería': [
    'Habilitación SENASA – Establecimiento Elaborador de Productos de Origen Animal',
    'Tránsito Federal SENASA – Ciclo II / Ciclo III (productos de origen animal)',
    'RNE – Registro Nacional de Establecimiento (ANMAT / Autoridad Sanitaria Jurisdiccional)',
    'RNPA – Registro Nacional de Producto Alimentario (ANMAT)',
    'Cumplimiento Código Alimentario Argentino (CAA) – Ley 18.284',
    'Certificado de Buenas Prácticas de Manufactura (BPM) – Res. SENASA 233/98',
  ],
  'Dulces y Golosinas': [
    'RNE – Registro Nacional de Establecimiento (ANMAT / Autoridad Sanitaria Jurisdiccional)',
    'RNPA – Registro Nacional de Producto Alimentario (ANMAT)',
    'Cumplimiento Código Alimentario Argentino (CAA) – Ley 18.284',
    'Certificado de Buenas Prácticas de Manufactura (BPM) – Res. SENASA 233/98',
    'Etiquetado Nutricional Frontal – Ley 27.642 (sellos de advertencia)',
  ],
  'Chocolate': [
    'RNE – Registro Nacional de Establecimiento (ANMAT / Autoridad Sanitaria Jurisdiccional)',
    'RNPA – Registro Nacional de Producto Alimentario (ANMAT)',
    'Cumplimiento Código Alimentario Argentino (CAA) – Ley 18.284',
    'Certificado de Buenas Prácticas de Manufactura (BPM) – Res. SENASA 233/98',
    'Etiquetado Nutricional Frontal – Ley 27.642 (sellos de advertencia)',
  ],
  'Snacks Internacionales': [
    'RNE – Registro Nacional de Establecimiento (ANMAT / Autoridad Sanitaria Jurisdiccional)',
    'RNPA – Registro Nacional de Producto Alimentario (ANMAT)',
    'Cumplimiento Código Alimentario Argentino (CAA) – Ley 18.284',
    'Etiquetado Nutricional Frontal – Ley 27.642 (sellos de advertencia)',
    'Registro como Importador de Alimentos (ANMAT-INAL / ARCA / Aduana)',
    'Etiquetado en Castellano de Alimentos Importados (CAA / Ley 24.240)',
  ],
  'Especias y Condimentos': [
    'Habilitación SENASA / Autoridad Sanitaria – Fraccionador de Productos Vegetales',
    'RNE – Registro Nacional de Establecimiento (ANMAT / Autoridad Sanitaria Jurisdiccional)',
    'RNPA – Registro Nacional de Producto Alimentario (ANMAT)',
    'Cumplimiento Código Alimentario Argentino (CAA) – Ley 18.284',
  ],
  'Té e Infusiones': [
    'Habilitación SENASA / Autoridad Sanitaria – Fraccionador de Productos Vegetales',
    'RNE – Registro Nacional de Establecimiento (ANMAT / Autoridad Sanitaria Jurisdiccional)',
    'RNPA – Registro Nacional de Producto Alimentario (ANMAT)',
    'Cumplimiento Código Alimentario Argentino (CAA) – Ley 18.284',
  ],
  'Tabaco y Puros': [
    'Inscripción Impuestos Internos – Tabaco (ARCA/AFIP – Ley 24.674)',
    'Cumplimiento Ley 26.687 – Regulación Publicidad, Promoción y Consumo de Tabaco',
    'Habilitación Municipal – Rubro Tabaquería / Comercio de Productos de Tabaco',
  ],
  'Belleza y Skincare': [
    'Habilitación Sanitaria ANMAT – Establecimiento Elaborador de Cosméticos (Disposición 7939/2025)',
    'Inscripción de Producto Cosmético ante ANMAT (Disposición 236/2026)',
    'Director Técnico Habilitado – Establecimiento Cosmético (ANMAT)',
  ],
  'Bienestar y Salud': [
    'RNPA – Registro de Suplementos Dietarios como Alimentos de Régimen Especial (ANMAT)',
    'RNE – Habilitación de Establecimiento para Suplementos Dietarios (ANMAT)',
  ],
  'Medias y Calcetines': [
    'Etiquetado de Indumentaria – Resolución 549/2021 (Reglamento MERCOSUR GMC 9/2000) y Ley 22.802',
    'Inscripción como Fabricante / Importador de Indumentaria (ARCA / Secretaría de Comercio)',
  ],
  'Ropa Interior y Lencería': [
    'Etiquetado de Indumentaria – Resolución 549/2021 (Reglamento MERCOSUR GMC 9/2000) y Ley 22.802',
    'Inscripción como Fabricante / Importador de Indumentaria (ARCA / Secretaría de Comercio)',
  ],
  'Moda y Accesorios': [
    'Etiquetado de Indumentaria – Resolución 549/2021 (Reglamento MERCOSUR GMC 9/2000) y Ley 22.802',
    'Inscripción como Fabricante / Importador de Indumentaria (ARCA / Secretaría de Comercio)',
  ],
  'Joyería y Bisutería': [
    'Inscripción ARCA – Comerciante de Metales y Piedras Preciosas',
    'Marcado de Ley de Metales Preciosos (Contraste / Quilataje) – Código de Comercio',
  ],
  'Cristales y Piedras': [
    'Habilitación Municipal – Rubro Regalería / Artículos de Regalo y Decoración',
    'Registro ante SEGEMAR – Comercio de Minerales y Rocas',
  ],
  'Esotérico y Espiritual': [
    'Habilitación Municipal – Rubro Regalería / Artículos de Regalo y Decoración',
  ],
  'Velas y Aromaterapia': [
    'Habilitación Municipal – Elaboración de Productos con Sustancias Inflamables (Velas)',
    'Inscripción ANMAT – Aceites Esenciales y Difusores con Indicación de Uso Cosmético',
  ],
  'Papelería y Stationery': [
    'Habilitación Municipal – Rubro Librería / Papelería / Insumos para Bellas Artes',
  ],
  'Arte y Manualidades': [
    'Habilitación Municipal – Rubro Librería / Papelería / Insumos para Bellas Artes',
  ],
  'Gaming y Geek': [
    'Licencia de Propiedad Intelectual / Marca (INPI – Ley 22.362 y Ley 11.723)',
    'Registro de Importador ante ARCA/Aduana – Merchandising y Figuras',
  ],
  'Anime y Manga': [
    'Licencia de Propiedad Intelectual / Marca (INPI – Ley 22.362 y Ley 11.723)',
    'Registro de Importador ante ARCA/Aduana – Merchandising y Figuras',
  ],
  'Mascotas': [
    'Registro SENASA – Alimentos y Snacks para Animales de Compañía',
    'Registro de Producto Veterinario (SENASA – DILAVE)',
  ],
  'Plantas y Jardín': [
    'Registro de Productor / Comerciante de Material Vegetal (SENASA)',
    'Certificado Fitosanitario de Origen (SENASA) – Traslado Interprovincial',
  ],
  'Outdoor y Aventura': [
    'Certificación de Seguridad de Equipos de Protección Personal (IRAM / INTI)',
  ],
  'Fósiles y Curiosidades': [
    'Autorización de Comercialización – Ley 25.743 de Protección del Patrimonio Arqueológico y Paleontológico',
    'Registro ante SEGEMAR – Comercio de Minerales y Rocas',
  ],
  'Niños y Juguetes': [
    'Certificación de Seguridad de Juguetes – Resolución S.I.y C. 313/2025',
    'Marcado de Conformidad – Juguetes (Res. 237/2024 S.I.C. y Res. 313/2025)',
    'ISBN – Número Internacional de Libro (AABI / Cámara Argentina del Libro)',
  ],
  'Destilados y Cocktails': [
    'Inscripción Impuestos Internos – Bebidas Alcohólicas (ARCA/AFIP – Ley 24.674)',
    'Habilitación Bromatológica / SENASA para Elaboración de Bebidas Alcohólicas',
    'Declaración de Cumplimiento Ley 24.788 – Lucha contra el Alcoholismo',
  ],
};

for (const category of allCategories) {
  const specificLicenses = CATEGORY_LICENSE_MAP[category.name] ?? [];
  const licenseNames = [...UNIVERSAL_LICENSES, ...specificLicenses];
  for (const licenseName of licenseNames) {
    const idLicenseTypes = licenseByName.get(licenseName);
    if (!idLicenseTypes) {
      console.warn(`Tipo de licencia no encontrado en seed: "${licenseName}"`);
      continue;
    }
    await prisma.category_License_Type.create({
      data: {
        idCategories: category.id,
        idLicenseTypes,
      },
    });
  }
}

console.log('🎉 Seed completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
