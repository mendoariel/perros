import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBeforeMigration() {
  console.log('🔍 Verificando datos antes de la migración...\n');

  let medalsWithOldStates: Array<{ status: string; count: bigint }> = [];
  let virginMedalsWithOldStates: Array<{ status: string; count: bigint }> = [];
  let scannedMedalsWithOldStates: Array<{ status: string; count: bigint }> = [];
  let partnersWithOldTypes: Array<{ partner_type: string; count: bigint }> = [];

  try {
    // Usar SQL raw porque los valores ya no existen en el enum del cliente
    medalsWithOldStates = await prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
      SELECT status, COUNT(*)::int as count
      FROM medals
      WHERE status IN ('REGISTERED', 'PENDING_CONFIRMATION')
      GROUP BY status
    `;
  } catch (error: any) {
    if (error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('⚠️  Tabla "medals" no existe o no está accesible');
    } else {
      throw error;
    }
  }

  try {
    virginMedalsWithOldStates = await prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
      SELECT status, COUNT(*)::int as count
      FROM virgin_medals
      WHERE status IN ('REGISTERED', 'PENDING_CONFIRMATION')
      GROUP BY status
    `;
  } catch (error: any) {
    if (error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('⚠️  Tabla "virgin_medals" no existe o no está accesible');
    } else {
      throw error;
    }
  }

  try {
    scannedMedalsWithOldStates = await prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
      SELECT status, COUNT(*)::int as count
      FROM scanned_medals
      WHERE status IN ('REGISTERED', 'PENDING_CONFIRMATION')
      GROUP BY status
    `;
  } catch (error: any) {
    if (error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('⚠️  Tabla "scanned_medals" no existe o no está accesible (puede ser normal si es una base de datos nueva)');
    } else {
      throw error;
    }
  }

  try {
    partnersWithOldTypes = await prisma.$queryRaw<Array<{ partner_type: string; count: bigint }>>`
      SELECT partner_type, COUNT(*)::int as count
      FROM partners
      WHERE partner_type IN ('VETERINARY', 'MINIMARKET', 'CAFETERIA')
      GROUP BY partner_type
    `;
  } catch (error: any) {
    if (error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('⚠️  Tabla "partners" no existe o no está accesible');
    } else {
      throw error;
    }
  }

  // Mostrar resultados
  console.log('📊 Resultados:\n');

  if (medalsWithOldStates.length > 0) {
    console.log('⚠️  Medals con estados antiguos:');
    medalsWithOldStates.forEach(item => {
      console.log(`   - ${item.status}: ${Number(item.count)} registros`);
    });
  } else {
    console.log('✅ No hay medals con estados antiguos');
  }

  if (virginMedalsWithOldStates.length > 0) {
    console.log('⚠️  VirginMedals con estados antiguos:');
    virginMedalsWithOldStates.forEach(item => {
      console.log(`   - ${item.status}: ${Number(item.count)} registros`);
    });
  } else {
    console.log('✅ No hay virgin_medals con estados antiguos');
  }

  if (scannedMedalsWithOldStates.length > 0) {
    console.log('⚠️  ScannedMedals con estados antiguos:');
    scannedMedalsWithOldStates.forEach(item => {
      console.log(`   - ${item.status}: ${Number(item.count)} registros`);
    });
  } else {
    console.log('✅ No hay scanned_medals con estados antiguos');
  }

  if (partnersWithOldTypes.length > 0) {
    console.log('⚠️  Partners con tipos antiguos:');
    partnersWithOldTypes.forEach(item => {
      console.log(`   - ${item.partner_type}: ${Number(item.count)} registros`);
    });
  } else {
    console.log('✅ No hay partners con tipos antiguos');
  }

  const totalAffected = 
    medalsWithOldStates.reduce((sum, item) => sum + Number(item.count), 0) +
    virginMedalsWithOldStates.reduce((sum, item) => sum + Number(item.count), 0) +
    scannedMedalsWithOldStates.reduce((sum, item) => sum + Number(item.count), 0) +
    partnersWithOldTypes.reduce((sum, item) => sum + Number(item.count), 0);

  console.log(`\n📈 Total de registros afectados: ${totalAffected}`);

  if (totalAffected > 0) {
    console.log('\n⚠️  IMPORTANTE: Hay datos que necesitan migración.');
    console.log('   Ejecuta el script de migración de datos antes de aplicar la migración de Prisma.');
    console.log('   Comando: npx ts-node scripts/migrate-data-before-schema.ts');
  } else {
    console.log('\n✅ No hay datos que migrar. Puedes aplicar la migración de Prisma de forma segura.');
  }

  await prisma.$disconnect();
}

checkBeforeMigration()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
