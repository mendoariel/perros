import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  console.log('🔍 Verificando tablas existentes en la base de datos...\n');

  try {
    // Obtener lista de tablas
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('📊 Tablas existentes:');
    tables.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });

    console.log(`\n📈 Total: ${tables.length} tablas`);

    // Verificar si scanned_medals existe
    const scannedMedalsExists = tables.some(t => t.tablename === 'scanned_medals');
    
    if (!scannedMedalsExists) {
      console.log('\n⚠️  La tabla "scanned_medals" NO existe.');
      console.log('   Esto puede ser normal si es una base de datos nueva.');
      console.log('   Opciones:');
      console.log('   1. Crear la tabla primero con una migración');
      console.log('   2. Comentar temporalmente el modelo ScannedMedal del schema');
      console.log('   3. Usar una migración SQL manual solo para callejero');
    } else {
      console.log('\n✅ La tabla "scanned_medals" existe.');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
