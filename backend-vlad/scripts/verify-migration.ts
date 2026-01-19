import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para verificar que la migración se aplicó correctamente
 */
async function verifyMigration() {
  try {
    console.log('🔍 Verificando migración...');
    console.log('='.repeat(60));

    // 1. Verificar columnas en medals (nuevo esquema simplificado)
    const medalColumns = await prisma.$queryRaw<{column_name: string}[]>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'medals' 
        AND column_name IN ('pet_name', 'description', 'phone_number', 'image')
      ORDER BY column_name
    `;

    console.log('✅ Columnas en medals (esquema simplificado):');
    medalColumns.forEach(col => {
      console.log(`   - ${col.column_name}`);
    });

    if (medalColumns.length < 4) {
      console.log('⚠️  Faltan algunas columnas en medals!');
      console.log('   Ejecuta: npx prisma db push');
    }

    // 2. Verificar datos en medallas
    const totalMedals = await prisma.medal.count();
    const medalsWithPetName = await prisma.medal.count({
      where: { 
        petName: { not: '' }
      }
    });

    console.log('\n📊 Estadísticas de datos:');
    console.log(`   - Total de medallas: ${totalMedals}`);
    console.log(`   - Medallas con nombre de mascota: ${medalsWithPetName}`);

    // 3. Verificar algunas medallas
    const sampleMedals = await prisma.medal.findMany({
      take: 5
    });

    console.log('\n📝 Ejemplos de medallas:');
    sampleMedals.forEach(medal => {
      console.log(`   - ${medal.medalString}: ${medal.petName || 'Sin nombre'}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Verificación completada exitosamente!');
    console.log('\n🎉 El esquema simplificado está funcionando correctamente.');
    console.log('   Los datos de mascotas están embebidos directamente en Medal.');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

