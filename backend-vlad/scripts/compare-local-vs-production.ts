import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

async function compareDatabases() {
  console.log('🔍 Comparando bases de datos Local vs Producción...\n');

  // Base de datos local
  const localPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  // Base de datos de producción (si está configurada)
  const productionUrl = process.env.PRODUCTION_DATABASE_URL || 
    process.env.DATABASE_URL?.replace('peludosclick', 'peludosclick_prod') ||
    null;

  if (!productionUrl) {
    console.log('⚠️  PRODUCTION_DATABASE_URL no está configurada.');
    console.log('   Solo se verificará la base de datos local.\n');
  }

  try {
    // Verificar local
    console.log('📊 BASE DE DATOS LOCAL:');
    console.log('─'.repeat(50));
    
    const localMedals = await localPrisma.medal.count();
    const localUsers = await localPrisma.user.count();

    console.log(`   Medallas: ${localMedals}`);
    console.log(`   Usuarios: ${localUsers}`);

    const localEnabled = await localPrisma.medal.count({
      where: { status: 'ENABLED' }
    });
    console.log(`   Medallas ENABLED: ${localEnabled}`);

    // Verificar producción si está configurada
    if (productionUrl) {
      console.log('\n📊 BASE DE DATOS PRODUCCIÓN:');
      console.log('─'.repeat(50));
      
      const productionPrisma = new PrismaClient({
        datasources: {
          db: {
            url: productionUrl
          }
        }
      });

      try {
        const prodMedals = await productionPrisma.medal.count();
        const prodUsers = await productionPrisma.user.count();

        console.log(`   Medallas: ${prodMedals}`);
        console.log(`   Usuarios: ${prodUsers}`);

        const prodEnabled = await productionPrisma.medal.count({
          where: { status: 'ENABLED' }
        });
        console.log(`   Medallas ENABLED: ${prodEnabled}`);

        // Comparación
        console.log('\n📊 COMPARACIÓN:');
        console.log('─'.repeat(50));
        console.log(`   Diferencia en medallas: ${prodMedals - localMedals}`);
        console.log(`   Diferencia en usuarios: ${prodUsers - localUsers}`);

        if (prodMedals > 0 && localMedals === 0) {
          console.log('\n⚠️  CONCLUSIÓN:');
          console.log('   La base de datos LOCAL está vacía pero PRODUCCIÓN tiene datos.');
          console.log('   Esto es normal en desarrollo.');
          console.log('   Si necesitas datos locales, restaura desde un backup de producción.');
        } else if (prodMedals === 0 && localMedals === 0) {
          console.log('\n⚠️  CONCLUSIÓN:');
          console.log('   Ambas bases de datos están vacías.');
          console.log('   Verifica que estés conectado a la base de datos correcta.');
        } else if (prodMedals > 0 && localMedals > 0) {
          console.log('\n✅ CONCLUSIÓN:');
          console.log('   Ambas bases de datos tienen datos.');
        }

        await productionPrisma.$disconnect();
      } catch (error: any) {
        console.error('❌ Error conectando a producción:', error.message);
        console.log('   Verifica que PRODUCTION_DATABASE_URL esté correcta.');
      }
    }

    // Conclusión general
    console.log('\n📋 RESUMEN:');
    console.log('─'.repeat(50));
    
    if (localMedals === 0) {
      console.log('⚠️  La base de datos LOCAL está vacía.');
      console.log('   Esto puede ser normal si:');
      console.log('   - Es un ambiente de desarrollo nuevo');
      console.log('   - Se reinició la base de datos');
      console.log('   - No se han creado datos de prueba');
      console.log('\n   Si necesitas datos:');
      console.log('   1. Restaura desde un backup de producción');
      console.log('   2. O crea datos de prueba manualmente');
    } else {
      console.log('✅ La base de datos LOCAL tiene datos.');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await localPrisma.$disconnect();
  }
}

compareDatabases()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  });
