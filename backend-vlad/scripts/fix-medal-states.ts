import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para actualizar estados obsoletos antes de aplicar el schema simplificado
 */
async function fixMedalStates() {
  try {
    console.log('🔄 Actualizando estados obsoletos...');
    console.log('='.repeat(60));

    // Verificar qué estados existen actualmente
    const currentStates = await prisma.$queryRaw<any[]>`
      SELECT DISTINCT status::text as status
      FROM medals
    `;
    
    console.log('\n📊 Estados actuales en medals:');
    currentStates.forEach(s => {
      console.log(`   - ${s.status}`);
    });

    // Verificar si hay estados REGISTERED o PENDING_CONFIRMATION
    const registeredCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM medals
      WHERE status::text = 'REGISTERED'
    `;

    const pendingCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM medals
      WHERE status::text = 'PENDING_CONFIRMATION'
    `;

    console.log(`\n📊 Medallas con estado REGISTERED: ${Number(registeredCount[0]?.count || 0)}`);
    console.log(`📊 Medallas con estado PENDING_CONFIRMATION: ${Number(pendingCount[0]?.count || 0)}`);

    // Actualizar usando ALTER TYPE para agregar ENABLED si no existe y luego cambiar valores
    // Primero, intentar cambiar directamente los valores
    if (Number(registeredCount[0]?.count || 0) > 0) {
      console.log('\n📦 Actualizando estados REGISTERED a ENABLED...');
      
      // Intentar alterar el enum primero para agregar ENABLED si no existe
      try {
        await prisma.$executeRawUnsafe(`
          DO $$ 
          BEGIN
            -- Agregar ENABLED al enum si no existe
            IF NOT EXISTS (
              SELECT 1 FROM pg_enum 
              WHERE enumlabel = 'ENABLED' 
              AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'medal_state')
            ) THEN
              ALTER TYPE medal_state ADD VALUE IF NOT EXISTS 'ENABLED';
            END IF;
          END $$;
        `);
      } catch (e: any) {
        console.log('   ⚠️  No se pudo agregar al enum (puede que ya exista)');
      }

      // Cambiar los valores directamente usando ALTER TYPE
      await prisma.$executeRawUnsafe(`
        UPDATE medals 
        SET status = 'ENABLED'::medal_state
        WHERE status::text = 'REGISTERED'
      `);
      
      console.log('   ✅ Estados REGISTERED actualizados a ENABLED en medals');
    }

    if (Number(pendingCount[0]?.count || 0) > 0) {
      console.log('\n📦 Actualizando estados PENDING_CONFIRMATION a ENABLED...');
      await prisma.$executeRawUnsafe(`
        UPDATE medals 
        SET status = 'ENABLED'::medal_state
        WHERE status::text = 'PENDING_CONFIRMATION'
      `);
      console.log('   ✅ Estados PENDING_CONFIRMATION actualizados a ENABLED en medals');
    }

    // Hacer lo mismo para virgin_medals y scanned_medals
    const virginRegistered = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM virgin_medals
      WHERE status::text = 'REGISTERED'
    `;

    if (Number(virginRegistered[0]?.count || 0) > 0) {
      await prisma.$executeRawUnsafe(`
        UPDATE virgin_medals 
        SET status = 'ENABLED'::medal_state
        WHERE status::text = 'REGISTERED'
      `);
      console.log('   ✅ Estados REGISTERED actualizados en virgin_medals');
    }

    const scannedRegistered = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM scanned_medals
      WHERE status::text = 'REGISTERED'
    `;

    if (Number(scannedRegistered[0]?.count || 0) > 0) {
      await prisma.$executeRawUnsafe(`
        UPDATE scanned_medals 
        SET status = 'ENABLED'::medal_state
        WHERE status::text = 'REGISTERED'
      `);
      console.log('   ✅ Estados REGISTERED actualizados en scanned_medals');
    }

    console.log('\n✅ Estados actualizados exitosamente!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixMedalStates()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
