const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restoreAllVirginMedals() {
  try {
    console.log('🚀 Iniciando restauración de todas las Virgin Medals a estado VIRGIN');
    console.log('==================================================');
    
    // Usar SQL directo para evitar problemas con estados inválidos
    const result = await prisma.$executeRaw`
      UPDATE virgin_medals 
      SET status = 'VIRGIN' 
      WHERE status != 'VIRGIN'
    `;

    console.log(`✅ ${result} Virgin Medals actualizadas a estado VIRGIN`);

    // Verificar el estado final
    const allVirginMedals = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM virgin_medals
      GROUP BY status
      ORDER BY status
    `;

    console.log('\n📊 Estado final de Virgin Medals:');
    console.log('=====================================');
    allVirginMedals.forEach(row => {
      console.log(`  - ${row.status}: ${row.count}`);
    });

    const total = await prisma.virginMedal.count();
    console.log(`\n✅ Total de Virgin Medals: ${total}`);
    console.log('🎉 Restauración completada exitosamente');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Error durante la restauración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAllVirginMedals();

