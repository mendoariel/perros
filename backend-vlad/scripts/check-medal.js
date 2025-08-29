const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMedal(medalString) {
  try {
    console.log(`🔍 Verificando medalla: ${medalString}`);
    
    // Verificar en tabla medals
    const medal = await prisma.medal.findFirst({
      where: {
        medalString: medalString
      }
    });

    if (medal) {
      console.log(`✅ Medalla encontrada en tabla 'medals':`);
      console.log(`   - ID: ${medal.id}`);
      console.log(`   - Status: ${medal.status}`);
      console.log(`   - Pet Name: ${medal.petName}`);
    } else {
      console.log(`❌ No se encontró medalla en tabla 'medals'`);
    }

    // Verificar en tabla virginMedals
    const virginMedal = await prisma.virginMedal.findFirst({
      where: {
        medalString: medalString
      }
    });

    if (virginMedal) {
      console.log(`✅ VirginMedal encontrada:`);
      console.log(`   - ID: ${virginMedal.id}`);
      console.log(`   - Status: ${virginMedal.status}`);
      console.log(`   - Created At: ${virginMedal.createdAt}`);
      console.log(`   - Updated At: ${virginMedal.updatedAt}`);
    } else {
      console.log(`❌ No se encontró VirginMedal`);
    }

  } catch (error) {
    console.error(`❌ Error durante la verificación:`, error);
    throw error;
  }
}

// Función principal
async function main() {
  const medalString = process.argv[2];
  
  if (!medalString) {
    console.error('❌ Error: Debes proporcionar un medalString como argumento');
    console.log('Uso: node check-medal.js <medalString>');
    process.exit(1);
  }

  console.log(`🚀 Verificando medalla: ${medalString}`);
  console.log('=' .repeat(50));

  try {
    await checkMedal(medalString);
    console.log('=' .repeat(50));
    console.log('✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
main();
