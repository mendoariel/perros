import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEnumTypes() {
  try {
    console.log('🔍 Verificando tipos enum en la base de datos...');
    console.log('='.repeat(60));

    // Verificar qué enums existen
    const enumTypes = await prisma.$queryRaw<any[]>`
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname LIKE '%medal%' OR t.typname LIKE '%state%'
      GROUP BY t.typname
      ORDER BY t.typname
    `;

    console.log('\n📊 Tipos enum encontrados:');
    enumTypes.forEach(e => {
      console.log(`\n   ${e.enum_name}:`);
      console.log(`      Valores: ${e.enum_values.join(', ')}`);
    });

    // Verificar estados en cada tabla
    console.log('\n📊 Estados en cada tabla:');
    
    const medalStates = await prisma.$queryRaw<any[]>`
      SELECT status::text as status, COUNT(*) as count
      FROM medals
      GROUP BY status
      ORDER BY status
    `;
    
    console.log('\n   medals:');
    medalStates.forEach(s => {
      console.log(`      - ${s.status}: ${s.count}`);
    });

    const virginStates = await prisma.$queryRaw<any[]>`
      SELECT status::text as status, COUNT(*) as count
      FROM virgin_medals
      GROUP BY status
      ORDER BY status
    `;
    
    console.log('\n   virgin_medals:');
    virginStates.forEach(s => {
      console.log(`      - ${s.status}: ${s.count}`);
    });

    const scannedStates = await prisma.$queryRaw<any[]>`
      SELECT status::text as status, COUNT(*) as count
      FROM scanned_medals
      GROUP BY status
      ORDER BY status
    `;
    
    console.log('\n   scanned_medals:');
    scannedStates.forEach(s => {
      console.log(`      - ${s.status}: ${s.count}`);
    });

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkEnumTypes()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
