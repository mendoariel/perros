import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyPetsData() {
  console.log('🔍 Verificando datos de mascotas después de la migración...\n');

  try {
    // 1. Contar total de medallas
    const totalMedals = await prisma.medal.count();
    console.log(`📊 Total de medallas: ${totalMedals}`);

    // 2. Contar por estado
    const medalsByStatus = await prisma.medal.groupBy({
      by: ['status'],
      _count: true
    });
    console.log('\n📊 Medallas por estado:');
    medalsByStatus.forEach(item => {
      console.log(`   - ${item.status}: ${item._count}`);
    });

    // 3. Verificar medallas habilitadas con datos de mascotas
    const enabledMedals = await prisma.medal.findMany({
      where: {
        status: 'ENABLED'
      }
    });

    console.log(`\n📊 Medallas ENABLED: ${enabledMedals.length}`);
    
    const medalsWithPetName = enabledMedals.filter(m => m.petName && m.petName.trim() !== '');
    const medalsWithoutPetName = enabledMedals.filter(m => !m.petName || m.petName.trim() === '');
    
    console.log(`   - Con nombre de mascota: ${medalsWithPetName.length}`);
    console.log(`   - Sin nombre de mascota: ${medalsWithoutPetName.length}`);

    if (medalsWithoutPetName.length > 0) {
      console.log('\n⚠️  Medallas sin nombre de mascota:');
      medalsWithoutPetName.forEach(m => {
        console.log(`   - ${m.medalString} (status: ${m.status})`);
      });
    }

    // 5. Resumen final
    console.log('\n✅ Verificación completada');
    
    if (totalMedals === 0) {
      console.log('\n⚠️  ADVERTENCIA: No hay medallas en la base de datos.');
      console.log('   Esto puede ser normal si es una base de datos nueva.');
    } else if (enabledMedals.length === 0) {
      console.log('\n⚠️  ADVERTENCIA: No hay medallas ENABLED.');
      console.log('   Las mascotas solo se muestran si tienen medallas ENABLED.');
    } else if (medalsWithPetName.length === 0) {
      console.log('\n⚠️  ADVERTENCIA: Las medallas ENABLED no tienen nombre de mascota.');
      console.log('   Esto puede indicar un problema en los datos embebidos.');
    } else {
      console.log('\n✅ Los datos parecen estar correctos.');
    }

  } catch (error: any) {
    console.error('❌ Error verificando datos:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyPetsData()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  });
