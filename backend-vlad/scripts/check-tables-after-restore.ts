import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function checkTables() {
  console.log('🔍 Verificando tablas en la base de datos...\n');

  try {
    // Obtener todas las tablas
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('📊 Tablas encontradas:');
    tables.forEach(t => {
      console.log(`   - ${t.tablename}`);
    });

    // Verificar tablas específicas
    const hasDogs = tables.some(t => t.tablename === 'dogs');
    const hasCats = tables.some(t => t.tablename === 'cats');
    const hasPets = tables.some(t => t.tablename === 'pets');
    const hasMedals = tables.some(t => t.tablename === 'medals');
    const hasCallejeros = tables.some(t => t.tablename === 'callejeros');

    console.log('\n📋 Estado de tablas clave:');
    console.log(`   - medals: ${hasMedals ? '✅' : '❌'}`);
    console.log(`   - dogs: ${hasDogs ? '✅' : '❌'}`);
    console.log(`   - cats: ${hasCats ? '✅' : '❌'}`);
    console.log(`   - pets: ${hasPets ? '✅' : '❌'}`);
    console.log(`   - callejeros: ${hasCallejeros ? '✅' : '❌'}`);

    // Contar registros en medals
    if (hasMedals) {
      const medalCount = await prisma.medal.count();
      console.log(`\n📊 Registros en medals: ${medalCount}`);
    }

    // Verificar estructura de medals
    if (hasMedals) {
      console.log('\n🔍 Verificando estructura de medals...');
      try {
        const medalSample = await prisma.$queryRaw<Array<any>>`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'medals' 
          ORDER BY ordinal_position;
        `;
        console.log('   Columnas en medals:');
        medalSample.forEach(col => {
          console.log(`     - ${col.column_name} (${col.data_type})`);
        });
      } catch (e: any) {
        console.log('   ⚠️  Error verificando estructura:', e.message);
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  });
