const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyCleanup() {
  try {
    console.log('🔍 Verificando la limpieza de la medalla "Pantera"...\n');
    
    // 1. Verificar que el usuario aún existe
    const user = await prisma.user.findFirst({
      where: {
        email: 'mendoariel@hotmail.com'
      },
      include: {
        medals: true
      }
    });

    if (!user) {
      console.log('❌ El usuario mendoariel@hotmail.com no existe');
      return;
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Medallas restantes: ${user.medals.length}`);

    if (user.medals.length > 0) {
      console.log(`📋 Medallas restantes:`);
      user.medals.forEach(medal => {
        console.log(`   - ${medal.petName} (${medal.medalString}) - Status: ${medal.status}`);
      });
    }

    // 2. Verificar que la medalla "Pantera" ya no existe
    const panteraMedal = await prisma.medal.findFirst({
      where: {
        medalString: 'iemofap8ial462ymmjjwz8af9vma2nv0ct14'
      }
    });

    if (panteraMedal) {
      console.log(`❌ La medalla "Pantera" aún existe en la tabla medals`);
    } else {
      console.log(`✅ La medalla "Pantera" fue eliminada correctamente de la tabla medals`);
    }

    // 3. Verificar que la virginMedal fue restaurada
    const virginMedal = await prisma.virginMedal.findFirst({
      where: {
        medalString: 'iemofap8ial462ymmjjwz8af9vma2nv0ct14'
      }
    });

    if (virginMedal) {
      console.log(`✅ VirginMedal encontrada:`);
      console.log(`   - ID: ${virginMedal.id}`);
      console.log(`   - Medal String: ${virginMedal.medalString}`);
      console.log(`   - Status: ${virginMedal.status}`);
      console.log(`   - Register Hash: ${virginMedal.registerHash}`);
      
      if (virginMedal.status === 'VIRGIN') {
        console.log(`✅ VirginMedal restaurada correctamente a estado VIRGIN`);
      } else {
        console.log(`⚠️ VirginMedal no está en estado VIRGIN (actual: ${virginMedal.status})`);
      }
    } else {
      console.log(`❌ No se encontró la virginMedal para iemofap8ial462ymmjjwz8af9vma2nv0ct14`);
    }

    console.log(`\n📊 Resumen de la verificación:`);
    console.log(`   - Usuario mantenido: ${user ? '✅' : '❌'}`);
    console.log(`   - Medalla "Pantera" eliminada: ${!panteraMedal ? '✅' : '❌'}`);
    console.log(`   - VirginMedal restaurada: ${virginMedal && virginMedal.status === 'VIRGIN' ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
verifyCleanup()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error durante la verificación:', error);
    process.exit(1);
  });


