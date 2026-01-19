import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para verificar los datos actuales antes de migrar
 */
async function checkPetsData() {
  try {
    console.log('🔍 Verificando datos actuales...');
    console.log('='.repeat(60));

    // Verificar estructura de la tabla pets
    const petsCount = await prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(*) as count FROM pets
    `;

    console.log(`📊 Total de pets en la base de datos: ${petsCount[0].count}`);

    // Verificar si existe la columna pet_type
    const hasPetType = await prisma.$queryRaw<any[]>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pets' AND column_name = 'pet_type'
    `;

    if (hasPetType.length > 0) {
      console.log('✅ La columna pet_type existe en la tabla pets');
      
      // Contar por tipo
      const byType = await prisma.$queryRaw<any[]>`
        SELECT "pet_type", COUNT(*) as count
        FROM pets
        GROUP BY "pet_type"
      `;

      console.log('\n📊 Distribución por tipo:');
      byType.forEach((row: any) => {
        console.log(`   - ${row.pet_type || 'NULL'}: ${row.count}`);
      });

      // Ver algunos ejemplos
      const examples = await prisma.$queryRaw<any[]>`
        SELECT id, name, "pet_type", "phone_number"
        FROM pets
        LIMIT 5
      `;

      console.log('\n📝 Ejemplos de pets:');
      examples.forEach((pet: any) => {
        console.log(`   - ID: ${pet.id}, Nombre: ${pet.name}, Tipo: ${pet.pet_type || 'NULL'}`);
      });

    } else {
      console.log('⚠️ La columna pet_type NO existe en la tabla pets');
      console.log('   Esto significa que la migración ya se aplicó o la estructura es diferente');
    }

    // Verificar medallas con pets
    const medalsWithPets = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM medals
      WHERE "pet_id" IS NOT NULL
    `;

    console.log(`\n📊 Medallas con pets asociados: ${medalsWithPets[0].count}`);

    console.log('='.repeat(60));
    console.log('✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkPetsData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

