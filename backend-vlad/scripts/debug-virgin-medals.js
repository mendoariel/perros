const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugVirginMedals() {
  try {
    console.log('🔍 Debugging virgin_medals table...\n');
    
    const lilaMedalString = 'doc0hn8516yoevwirjpam5xefkoh4g26asc7';
    const pamelaMedalString = 'y5ppbb0ai9xvqptygr0siq3edpviz7mh1bnm';
    
    // Buscar todos los registros que contengan estos strings
    console.log('🔍 Buscando registros que contengan los medal strings...');
    
    const allVirginMedals = await prisma.virginMedal.findMany({
      where: {
        OR: [
          { medalString: { contains: 'doc0hn8516yoevwirjpam5xefkoh4g26asc7' } },
          { medalString: { contains: 'y5ppbb0ai9xvqptygr0siq3edpviz7mh1bnm' } }
        ]
      }
    });
    
    console.log(`📊 Encontrados ${allVirginMedals.length} registros:`);
    allVirginMedals.forEach((medal, index) => {
      console.log(`   ${index + 1}. ID: ${medal.id}, MedalString: ${medal.medalString}, Status: ${medal.status}`);
    });
    
    // Buscar específicamente por Lila
    console.log('\n🔍 Buscando específicamente por Lila...');
    const lilaVirgin = await prisma.virginMedal.findFirst({
      where: { medalString: lilaMedalString }
    });
    
    if (lilaVirgin) {
      console.log('✅ Lila encontrada en virgin_medals:');
      console.log(`   - ID: ${lilaVirgin.id}`);
      console.log(`   - Status: ${lilaVirgin.status}`);
      console.log(`   - Register Hash: ${lilaVirgin.registerHash}`);
    } else {
      console.log('❌ Lila NO encontrada en virgin_medals');
    }
    
    // Buscar específicamente por Pamela
    console.log('\n🔍 Buscando específicamente por Pamela...');
    const pamelaVirgin = await prisma.virginMedal.findFirst({
      where: { medalString: pamelaMedalString }
    });
    
    if (pamelaVirgin) {
      console.log('✅ Pamela encontrada en virgin_medals:');
      console.log(`   - ID: ${pamelaVirgin.id}`);
      console.log(`   - Status: ${pamelaVirgin.status}`);
      console.log(`   - Register Hash: ${pamelaVirgin.registerHash}`);
    } else {
      console.log('❌ Pamela NO encontrada en virgin_medals');
    }
    
    // Verificar si hay algún registro con estado ENABLED que pueda ser Lila
    console.log('\n🔍 Buscando registros con estado ENABLED...');
    const enabledVirginMedals = await prisma.virginMedal.findMany({
      where: { status: 'ENABLED' }
    });
    
    console.log(`📊 Encontrados ${enabledVirginMedals.length} registros ENABLED:`);
    enabledVirginMedals.forEach((medal, index) => {
      console.log(`   ${index + 1}. ID: ${medal.id}, MedalString: ${medal.medalString}, Status: ${medal.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugVirginMedals();






