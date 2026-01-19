import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMissingTables() {
  try {
    console.log('🔍 Verificando tablas en la base de datos...\n');
    
    // Obtener todas las tablas del schema de Prisma
    const expectedTables = [
      'users',
      'medals',
      'dogs',
      'cats',
      'pets',
      'callejeros',
      'virgin_medals',
      'scanned_medals',
      'registration_attempts',
      'partners',
      'articles',
      'services',
      'offers',
      'comments',
      'catalogs',
      'medal_fronts',
      'partner_images'
    ];
    
    // Obtener tablas existentes en la base de datos
    const existingTables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    const existingTableNames = existingTables.map(t => t.tablename);
    
    console.log(`📊 Tablas esperadas: ${expectedTables.length}`);
    console.log(`📊 Tablas encontradas: ${existingTableNames.length}\n`);
    
    // Encontrar tablas faltantes
    const missingTables = expectedTables.filter(table => !existingTableNames.includes(table));
    const extraTables = existingTableNames.filter(table => !expectedTables.includes(table) && !table.startsWith('_prisma'));
    
    if (missingTables.length > 0) {
      console.log('❌ Tablas FALTANTES:\n');
      missingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
      console.log('');
    } else {
      console.log('✅ Todas las tablas esperadas existen\n');
    }
    
    if (extraTables.length > 0) {
      console.log('ℹ️  Tablas adicionales (no en schema):\n');
      extraTables.forEach(table => {
        console.log(`   - ${table}`);
      });
      console.log('');
    }
    
    console.log('📋 Tablas existentes:\n');
    expectedTables.forEach(table => {
      const exists = existingTableNames.includes(table);
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    });
    
    // Si faltan tablas críticas, sugerir crear migración
    if (missingTables.length > 0) {
      console.log('\n💡 Recomendación:');
      console.log('   Ejecuta una migración de Prisma para crear las tablas faltantes:');
      console.log('   npx prisma migrate dev --name create_missing_tables');
      console.log('\n   O usa db push (solo desarrollo):');
      console.log('   npx prisma db push');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingTables();
