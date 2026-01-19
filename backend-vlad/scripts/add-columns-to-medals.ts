import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para agregar columnas del esquema simplificado a la tabla medals
 * de forma segura (agregando como nullable primero, luego migrando datos)
 */
async function addColumnsToMedals() {
  try {
    console.log('🔄 Agregando columnas del esquema simplificado a medals...');
    console.log('='.repeat(60));

    // Verificar qué columnas existen
    const existingColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'medals'
      AND column_name IN ('pet_name', 'description', 'phone_number', 'image')
    `;

    const existingColumnNames = existingColumns.map(c => c.column_name);
    console.log(`📊 Columnas existentes: ${existingColumnNames.join(', ') || 'ninguna'}`);

    // Verificar si existe tabla pets
    const hasPetsTable = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'pets'
    `;

    const hasPets = hasPetsTable.length > 0 && Number(hasPetsTable[0].count) > 0;
    console.log(`📊 Tabla pets existe: ${hasPets}`);

    if (hasPets) {
      // Paso 1: Agregar columnas como nullable si no existen
      console.log('\n📦 Paso 1: Agregando columnas nuevas...');
      
      if (!existingColumnNames.includes('pet_name')) {
        await prisma.$executeRaw`ALTER TABLE medals ADD COLUMN IF NOT EXISTS pet_name TEXT`;
        console.log('   ✅ Columna pet_name agregada');
      }
      
      if (!existingColumnNames.includes('description')) {
        await prisma.$executeRaw`ALTER TABLE medals ADD COLUMN IF NOT EXISTS description TEXT`;
        console.log('   ✅ Columna description agregada');
      }
      
      if (!existingColumnNames.includes('phone_number')) {
        await prisma.$executeRaw`ALTER TABLE medals ADD COLUMN IF NOT EXISTS phone_number TEXT`;
        console.log('   ✅ Columna phone_number agregada');
      }
      
      if (!existingColumnNames.includes('image')) {
        await prisma.$executeRaw`ALTER TABLE medals ADD COLUMN IF NOT EXISTS image TEXT`;
        console.log('   ✅ Columna image agregada');
      }

      // Paso 2: Copiar datos desde pets
      console.log('\n📦 Paso 2: Copiando datos desde pets...');
      
      const updateResult = await prisma.$executeRaw`
        UPDATE medals m
        SET 
          pet_name = COALESCE(p.pet_name, p.name, ''),
          description = COALESCE(p.description, ''),
          phone_number = COALESCE(p.phone_number, ''),
          image = p.image
        FROM pets p
        WHERE m.pet_id = p.id
        AND m.pet_id IS NOT NULL
      `;
      
      console.log(`   ✅ Datos copiados desde pets`);
      
      // Paso 3: Para medals sin pet_id, establecer valores por defecto
      await prisma.$executeRaw`
        UPDATE medals
        SET 
          pet_name = COALESCE(pet_name, ''),
          description = COALESCE(description, ''),
          phone_number = COALESCE(phone_number, '')
        WHERE pet_name IS NULL OR pet_name = ''
      `;
      
      console.log('   ✅ Valores por defecto establecidos');
      
    } else {
      console.log('\n⚠️  No se encontró tabla pets. Las columnas se agregarán pero quedarán vacías.');
      
      // Agregar columnas de todos modos
      if (!existingColumnNames.includes('pet_name')) {
        await prisma.$executeRaw`ALTER TABLE medals ADD COLUMN IF NOT EXISTS pet_name TEXT DEFAULT ''`;
        console.log('   ✅ Columna pet_name agregada');
      }
      
      if (!existingColumnNames.includes('description')) {
        await prisma.$executeRaw`ALTER TABLE medals ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''`;
        console.log('   ✅ Columna description agregada');
      }
      
      if (!existingColumnNames.includes('phone_number')) {
        await prisma.$executeRaw`ALTER TABLE medals ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT ''`;
        console.log('   ✅ Columna phone_number agregada');
      }
      
      if (!existingColumnNames.includes('image')) {
        await prisma.$executeRaw`ALTER TABLE medals ADD COLUMN IF NOT EXISTS image TEXT`;
        console.log('   ✅ Columna image agregada');
      }
      
      // Establecer valores por defecto para registros existentes
      await prisma.$executeRaw`
        UPDATE medals
        SET 
          pet_name = COALESCE(pet_name, ''),
          description = COALESCE(description, ''),
          phone_number = COALESCE(phone_number, '')
        WHERE pet_name IS NULL OR pet_name = ''
      `;
    }

    // Paso 4: Verificar resultado
    console.log('\n📦 Paso 3: Verificando resultado...');
    const medalsWithData = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM medals
      WHERE pet_name IS NOT NULL AND pet_name != ''
    `;
    
    const totalMedals = await prisma.medal.count();
    console.log(`   📊 Total de medallas: ${totalMedals}`);
    console.log(`   📊 Medallas con pet_name: ${Number(medalsWithData[0]?.count || 0)}`);

    console.log('\n✅ Columnas agregadas exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Ejecuta: npx prisma db push (para sincronizar el resto del schema)');
    console.log('   2. Regenera Prisma Client: npx prisma generate');
    console.log('   3. Reinicia el servidor');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addColumnsToMedals()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
