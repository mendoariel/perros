const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.my-env-production' });

console.log('🔧 Configuración de base de datos:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'NO CONFIGURADO');
console.log('');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function eliminarFirstA3Production() {
  try {
    console.log('🔍 BUSCANDO REGISTROS CON "first-a3-production"...');
    console.log('==================================================');
    
    // 1. Buscar registros que contengan 'first-a3-production'
    const virginMedals = await prisma.virginMedal.findMany({
      where: {
        OR: [
          {
            medalString: {
              contains: 'first-a3-production'
            }
          },
          {
            registerHash: {
              contains: 'first-a3-production'
            }
          }
        ]
      }
    });

    console.log('🏆 REGISTROS ENCONTRADOS:');
    console.log('==========================');
    
    if (virginMedals.length === 0) {
      console.log('   - No se encontraron registros con "first-a3-production"');
      return;
    } else {
      virginMedals.forEach((virginMedal, index) => {
        console.log(`   ${index + 1}. Medal String: ${virginMedal.medalString}`);
        console.log(`      - ID: ${virginMedal.id}`);
        console.log(`      - Estado actual: ${virginMedal.status}`);
        console.log(`      - Register Hash: ${virginMedal.registerHash}`);
        console.log(`      - Creado: ${virginMedal.createdAt}`);
        console.log('');
      });
    }

    console.log('⚠️  ADVERTENCIA: Esta acción es IRREVERSIBLE');
    console.log('   Se eliminarán permanentemente:');
    console.log(`   - ${virginMedals.length} registro(s) de virgin_medals`);
    console.log('   - Todos los registros que contengan "first-a3-production"');
    console.log('');

    // Preguntar confirmación
    console.log('❓ ¿Estás seguro de que quieres eliminar estos registros?');
    console.log('   Esta acción NO se puede deshacer.');
    console.log('   Para continuar, ejecuta el script con el parámetro --confirm');
    console.log('');
    console.log('   Uso: node eliminar-first-a3-production.js --confirm');
    console.log('');

  } catch (error) {
    console.error('❌ Error durante la búsqueda:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function ejecutarEliminacion() {
  try {
    console.log('🔍 BUSCANDO REGISTROS CON "first-a3-production"...');
    console.log('==================================================');
    
    // 1. Buscar registros que contengan 'first-a3-production'
    const virginMedals = await prisma.virginMedal.findMany({
      where: {
        OR: [
          {
            medalString: {
              contains: 'first-a3-production'
            }
          },
          {
            registerHash: {
              contains: 'first-a3-production'
            }
          }
        ]
      }
    });

    if (virginMedals.length === 0) {
      console.log('   - No se encontraron registros con "first-a3-production"');
      return;
    }

    console.log(`📊 Se encontraron ${virginMedals.length} registros para eliminar`);
    console.log('');

    // EJECUTANDO LA ELIMINACIÓN REAL
    console.log('🔄 EJECUTANDO ELIMINACIÓN...');
    
    // Eliminar registros
    const result = await prisma.virginMedal.deleteMany({
      where: {
        OR: [
          {
            medalString: {
              contains: 'first-a3-production'
            }
          },
          {
            registerHash: {
              contains: 'first-a3-production'
            }
          }
        ]
      }
    });

    console.log(`✅ ${result.count} registro(s) eliminado(s) exitosamente`);
    console.log('');
    console.log('🎉 ELIMINACIÓN COMPLETADA EXITOSAMENTE');

  } catch (error) {
    console.error('❌ Error durante la eliminación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener argumentos desde línea de comandos
const args = process.argv.slice(2);
const confirm = args.includes('--confirm');

if (confirm) {
  console.log(`🗑️  ELIMINANDO REGISTROS CON "first-a3-production"`);
  console.log('==================================================');
  console.log('');
  ejecutarEliminacion();
} else {
  console.log(`🔍 BUSCANDO REGISTROS CON "first-a3-production"`);
  console.log('==================================================');
  console.log('');
  eliminarFirstA3Production();
}
