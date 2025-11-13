const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeMedalSwap() {
  try {
    console.log('🔍 Analizando estado actual de las medallas...\n');
    
    // Medal strings
    const pamelaMedalString = 'y5ppbb0ai9xvqptygr0siq3edpviz7mh1bnm';
    const lilaMedalString = 'doc0hn8516yoevwirjpam5xefkoh4g26asc7';
    
    console.log('📋 Medal Strings:');
    console.log(`   Pamela (actual): ${pamelaMedalString}`);
    console.log(`   Lila (nueva): ${lilaMedalString}\n`);
    
    // 1. Buscar medalla de Pamela en tabla medals
    console.log('🔍 Buscando medalla de Pamela en tabla medals...');
    const pamelaMedal = await prisma.medal.findFirst({
      where: { medalString: pamelaMedalString },
      include: { owner: true }
    });
    
    if (pamelaMedal) {
      console.log('✅ Medalla de Pamela encontrada en medals:');
      console.log(`   - ID: ${pamelaMedal.id}`);
      console.log(`   - Pet Name: ${pamelaMedal.petName}`);
      console.log(`   - Status: ${pamelaMedal.status}`);
      console.log(`   - Owner ID: ${pamelaMedal.ownerId}`);
      console.log(`   - Owner Email: ${pamelaMedal.owner?.email}`);
      console.log(`   - Description: ${pamelaMedal.description}`);
    } else {
      console.log('❌ Medalla de Pamela NO encontrada en medals');
    }
    
    // 2. Buscar medalla de Lila en tabla medals
    console.log('\n🔍 Buscando medalla de Lila en tabla medals...');
    const lilaMedal = await prisma.medal.findFirst({
      where: { medalString: lilaMedalString },
      include: { owner: true }
    });
    
    if (lilaMedal) {
      console.log('✅ Medalla de Lila encontrada en medals:');
      console.log(`   - ID: ${lilaMedal.id}`);
      console.log(`   - Pet Name: ${lilaMedal.petName}`);
      console.log(`   - Status: ${lilaMedal.status}`);
      console.log(`   - Owner ID: ${lilaMedal.ownerId}`);
      console.log(`   - Owner Email: ${lilaMedal.owner?.email}`);
    } else {
      console.log('❌ Medalla de Lila NO encontrada en medals (esperado - debe estar virgen)');
    }
    
    // 3. Buscar medalla de Pamela en tabla virgin_medals
    console.log('\n🔍 Buscando medalla de Pamela en tabla virgin_medals...');
    const pamelaVirginMedal = await prisma.virginMedal.findFirst({
      where: { medalString: pamelaMedalString }
    });
    
    if (pamelaVirginMedal) {
      console.log('✅ Medalla de Pamela encontrada en virgin_medals:');
      console.log(`   - ID: ${pamelaVirginMedal.id}`);
      console.log(`   - Status: ${pamelaVirginMedal.status}`);
      console.log(`   - Register Hash: ${pamelaVirginMedal.registerHash}`);
    } else {
      console.log('❌ Medalla de Pamela NO encontrada en virgin_medals');
    }
    
    // 4. Buscar medalla de Lila en tabla virgin_medals
    console.log('\n🔍 Buscando medalla de Lila en tabla virgin_medals...');
    const lilaVirginMedal = await prisma.virginMedal.findFirst({
      where: { medalString: lilaMedalString }
    });
    
    if (lilaVirginMedal) {
      console.log('✅ Medalla de Lila encontrada en virgin_medals:');
      console.log(`   - ID: ${lilaVirginMedal.id}`);
      console.log(`   - Status: ${lilaVirginMedal.status}`);
      console.log(`   - Register Hash: ${lilaVirginMedal.registerHash}`);
    } else {
      console.log('❌ Medalla de Lila NO encontrada en virgin_medals');
    }
    
    console.log('\n📊 RESUMEN DEL ESTADO ACTUAL:');
    console.log(`   Pamela en medals: ${pamelaMedal ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Lila en medals: ${lilaMedal ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Pamela en virgin_medals: ${pamelaVirginMedal ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Lila en virgin_medals: ${lilaVirginMedal ? '✅ SÍ' : '❌ NO'}`);
    
  } catch (error) {
    console.error('❌ Error analizando medallas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeMedalSwap();

