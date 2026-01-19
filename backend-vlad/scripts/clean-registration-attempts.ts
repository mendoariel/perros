import { PrismaClient, AttemptStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanRegistrationAttempts(medalString: string) {
  try {
    console.log(`🔍 Buscando intentos de registro para medalla: ${medalString}`);
    console.log('='.repeat(60));
    
    // Buscar todos los intentos de registro para esta medalla
    const attempts = await prisma.registrationAttempt.findMany({
      where: {
        medalString: medalString
      },
      include: {
        scannedMedal: true
      }
    });
    
    if (attempts.length === 0) {
      console.log(`✅ No se encontraron intentos de registro para esta medalla`);
      return;
    }
    
    console.log(`📋 Encontrados ${attempts.length} intento(s) de registro:`);
    attempts.forEach((attempt, index) => {
      console.log(`\n   ${index + 1}. Intent ID: ${attempt.id}`);
      console.log(`      - Email: ${attempt.email}`);
      console.log(`      - Status: ${attempt.status}`);
      console.log(`      - Created: ${attempt.createdAt}`);
      console.log(`      - Confirmed: ${attempt.confirmedAt || 'No'}`);
    });
    
    // Eliminar todos los intentos
    console.log(`\n🗑️  Eliminando todos los intentos de registro...`);
    await prisma.registrationAttempt.deleteMany({
      where: {
        medalString: medalString
      }
    });
    console.log(`✅ Intentos de registro eliminados`);
    
    // Limpiar scannedMedal también si existe
    const scannedMedal = await prisma.scannedMedal.findFirst({
      where: {
        medalString: medalString
      }
    });
    
    if (scannedMedal) {
      console.log(`\n🗑️  Eliminando ScannedMedal...`);
      await prisma.scannedMedal.delete({
        where: {
          id: scannedMedal.id
        }
      });
      console.log(`✅ ScannedMedal eliminado`);
    }
    
    console.log('\n🎉 Limpieza completada exitosamente');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Función principal
async function main() {
  const medalString = process.argv[2];
  
  if (!medalString) {
    console.error('❌ Error: Debes proporcionar un medalString como argumento');
    console.log('Uso: npx ts-node scripts/clean-registration-attempts.ts <medalString>');
    process.exit(1);
  }
  
  try {
    await cleanRegistrationAttempts(medalString);
    console.log('✅ Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
main();

