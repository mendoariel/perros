import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPetsAfterMigration() {
  console.log('🔍 Verificando estado de mascotas después de la migración...\n');

  try {
    // 1. Verificar total de registros
    const totalMedals = await prisma.medal.count();

    console.log('📊 Totales en la base de datos:');
    console.log(`   - Medallas: ${totalMedals}`);

    // 2. Verificar medallas ENABLED (las que se muestran)
    const enabledMedals = await prisma.medal.findMany({
      where: {
        status: 'ENABLED'
      }
    });

    console.log(`\n📊 Medallas ENABLED (visibles): ${enabledMedals.length}`);
    
    if (enabledMedals.length > 0) {
      console.log('\n📋 Detalle de medallas ENABLED:');
      enabledMedals.forEach((medal, index) => {
        const petName = medal.petName || 'Sin nombre';
        console.log(`   ${index + 1}. ${petName} - ${medal.medalString}`);
      });
    } else {
      console.log('\n⚠️  No hay medallas ENABLED');
      console.log('   Las mascotas solo se muestran si tienen status ENABLED');
    }

    // 3. Verificar todas las medallas por estado
    const medalsByStatus = await prisma.medal.groupBy({
      by: ['status'],
      _count: true
    });

    console.log('\n📊 Medallas por estado:');
    medalsByStatus.forEach(item => {
      console.log(`   - ${item.status}: ${item._count}`);
    });

    // 4. Verificar datos embebidos
    console.log('\n🔗 Verificando datos embebidos:');
    const medalsWithPetName = await prisma.medal.count({ 
      where: { 
        petName: { not: '' }
      } 
    });
    const medalsWithoutPetName = await prisma.medal.count({
      where: {
        OR: [
          { petName: '' },
          { petName: null }
        ]
      }
    });

    console.log(`   - Medallas con nombre de mascota: ${medalsWithPetName}`);
    console.log(`   - Medallas sin nombre de mascota: ${medalsWithoutPetName}`);

    // 5. Conclusión
    console.log('\n✅ Verificación completada\n');

    if (totalMedals === 0) {
      console.log('⚠️  CONCLUSIÓN: No hay medallas en la base de datos.');
      console.log('   Esto puede ser normal si es una base de datos nueva.');
    } else if (enabledMedals.length === 0) {
      console.log('⚠️  CONCLUSIÓN: Hay medallas pero ninguna está ENABLED.');
      console.log('   Las mascotas solo aparecen si su medalla tiene status ENABLED.');
      console.log('   Revisa las medallas con otros estados (INCOMPLETE, VIRGIN, etc.)');
    } else {
      console.log('✅ CONCLUSIÓN: Los datos están presentes.');
      console.log(`   Hay ${enabledMedals.length} mascota(s) visible(s) en el sistema.`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2025') {
      console.error('   Error: Modelo no encontrado. Verifica que Prisma Client esté regenerado.');
      console.error('   Ejecuta: npx prisma generate');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkPetsAfterMigration()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  });
