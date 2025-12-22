const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentState() {
  try {
    console.log('🔍 Verificando estado actual después del intercambio...\n');
    
    // Medal strings
    const pamelaMedalString = 'y5ppbb0ai9xvqptygr0siq3edpviz7mh1bnm';
    const lilaMedalString = 'doc0hn8516yoevwirjpam5xefkoh4g26asc7';
    
    console.log('📋 Medal Strings:');
    console.log(`   Pamela (original): ${pamelaMedalString}`);
    console.log(`   Lila (nueva): ${lilaMedalString}\n`);
    
    // 1. Verificar Lila en medals (debería tener los datos de Pamela)
    console.log('🔍 Verificando Lila en tabla medals...');
    const lilaMedal = await prisma.medal.findFirst({
      where: { medalString: lilaMedalString },
      include: { owner: true }
    });
    
    if (lilaMedal) {
      console.log('✅ Lila encontrada en medals:');
      console.log(`   - ID: ${lilaMedal.id}`);
      console.log(`   - Pet Name: ${lilaMedal.petName}`);
      console.log(`   - Status: ${lilaMedal.status}`);
      console.log(`   - Owner Email: ${lilaMedal.owner?.email}`);
    } else {
      console.log('❌ Lila NO encontrada en medals');
    }
    
    // 2. Verificar Lila en virgin_medals (debería estar ENABLED)
    console.log('\n🔍 Verificando Lila en tabla virgin_medals...');
    const lilaVirginMedal = await prisma.virginMedal.findFirst({
      where: { medalString: lilaMedalString }
    });
    
    if (lilaVirginMedal) {
      console.log('✅ Lila encontrada en virgin_medals:');
      console.log(`   - ID: ${lilaVirginMedal.id}`);
      console.log(`   - Status: ${lilaVirginMedal.status}`);
      console.log(`   - Register Hash: ${lilaVirginMedal.registerHash}`);
    } else {
      console.log('❌ Lila NO encontrada en virgin_medals');
    }
    
    // 3. Verificar Pamela en medals (no debería existir)
    console.log('\n🔍 Verificando Pamela en tabla medals...');
    const pamelaMedal = await prisma.medal.findFirst({
      where: { medalString: pamelaMedalString }
    });
    
    if (pamelaMedal) {
      console.log('❌ Pamela AÚN existe en medals (no debería)');
    } else {
      console.log('✅ Pamela NO existe en medals (correcto)');
    }
    
    // 4. Verificar Pamela en virgin_medals (debería estar VIRGIN)
    console.log('\n🔍 Verificando Pamela en tabla virgin_medals...');
    const pamelaVirginMedal = await prisma.virginMedal.findFirst({
      where: { medalString: pamelaMedalString }
    });
    
    if (pamelaVirginMedal) {
      console.log('✅ Pamela encontrada en virgin_medals:');
      console.log(`   - ID: ${pamelaVirginMedal.id}`);
      console.log(`   - Status: ${pamelaVirginMedal.status}`);
      console.log(`   - Register Hash: ${pamelaVirginMedal.registerHash}`);
    } else {
      console.log('❌ Pamela NO encontrada en virgin_medals');
    }
    
    console.log('\n📊 DIAGNÓSTICO:');
    if (lilaVirginMedal && lilaVirginMedal.status !== 'ENABLED') {
      console.log('⚠️  PROBLEMA: Lila en virgin_medals no está ENABLED');
      console.log(`   Estado actual: ${lilaVirginMedal.status}`);
      console.log('   Debería estar: ENABLED');
    } else if (!lilaVirginMedal) {
      console.log('⚠️  PROBLEMA: Lila no existe en virgin_medals');
    } else {
      console.log('✅ Lila en virgin_medals está correctamente configurada');
    }
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentState();






