import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateData() {
  console.log('🔄 Migrando datos antes de actualizar el schema...\n');

  try {
    await prisma.$executeRaw`
      -- Migrar estados REGISTERED a INCOMPLETE
      UPDATE medals 
      SET status = 'INCOMPLETE' 
      WHERE status = 'REGISTERED';
    `;
    console.log('✅ Migrados estados REGISTERED en medals');

    await prisma.$executeRaw`
      UPDATE virgin_medals 
      SET status = 'INCOMPLETE' 
      WHERE status = 'REGISTERED';
    `;
    console.log('✅ Migrados estados REGISTERED en virgin_medals');

    await prisma.$executeRaw`
      UPDATE scanned_medals 
      SET status = 'INCOMPLETE' 
      WHERE status = 'REGISTERED';
    `;
    console.log('✅ Migrados estados REGISTERED en scanned_medals');

    await prisma.$executeRaw`
      -- Migrar estados PENDING_CONFIRMATION a INCOMPLETE
      UPDATE medals 
      SET status = 'INCOMPLETE' 
      WHERE status = 'PENDING_CONFIRMATION';
    `;
    console.log('✅ Migrados estados PENDING_CONFIRMATION en medals');

    await prisma.$executeRaw`
      UPDATE virgin_medals 
      SET status = 'INCOMPLETE' 
      WHERE status = 'PENDING_CONFIRMATION';
    `;
    console.log('✅ Migrados estados PENDING_CONFIRMATION en virgin_medals');

    await prisma.$executeRaw`
      UPDATE scanned_medals 
      SET status = 'INCOMPLETE' 
      WHERE status = 'PENDING_CONFIRMATION';
    `;
    console.log('✅ Migrados estados PENDING_CONFIRMATION en scanned_medals');

    await prisma.$executeRaw`
      -- Migrar tipos de partner
      UPDATE partners 
      SET partner_type = 'VETERINARIAN' 
      WHERE partner_type = 'VETERINARY';
    `;
    console.log('✅ Migrados VETERINARY a VETERINARIAN en partners');

    await prisma.$executeRaw`
      UPDATE partners 
      SET partner_type = 'OTHER' 
      WHERE partner_type IN ('MINIMARKET', 'CAFETERIA');
    `;
    console.log('✅ Migrados MINIMARKET y CAFETERIA a OTHER en partners');

    console.log('\n✅ Migración de datos completada exitosamente!');
    console.log('   Ahora puedes aplicar la migración de Prisma de forma segura.');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateData()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  });
