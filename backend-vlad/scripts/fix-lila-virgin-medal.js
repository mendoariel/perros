const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixLilaVirginMedal() {
  try {
    console.log('🔧 Corrigiendo registro de Lila en virgin_medals...\n');
    
    const lilaMedalString = 'doc0hn8516yoevwirjpam5xefkoh4g26asc7';
    
    console.log(`📋 Medal String de Lila: ${lilaMedalString}\n`);
    
    // Verificar si ya existe
    console.log('🔍 Verificando si Lila ya existe en virgin_medals...');
    const existingLilaVirgin = await prisma.virginMedal.findFirst({
      where: { medalString: lilaMedalString }
    });
    
    if (existingLilaVirgin) {
      console.log('✅ Lila ya existe en virgin_medals:');
      console.log(`   - ID: ${existingLilaVirgin.id}`);
      console.log(`   - Status: ${existingLilaVirgin.status}`);
      
      // Actualizar a ENABLED si no lo está
      if (existingLilaVirgin.status !== 'ENABLED') {
        console.log('🔄 Actualizando estado a ENABLED...');
        const updatedLilaVirgin = await prisma.virginMedal.update({
          where: { id: existingLilaVirgin.id },
          data: { status: 'ENABLED' }
        });
        console.log(`✅ Estado actualizado: ${updatedLilaVirgin.status}`);
      } else {
        console.log('✅ Ya está en estado ENABLED');
      }
    } else {
      console.log('❌ Lila no existe en virgin_medals, creando registro...');
      
      // Crear nuevo registro para Lila
      const newLilaVirgin = await prisma.virginMedal.create({
        data: {
          medalString: lilaMedalString,
          status: 'ENABLED',
          registerHash: 'lila-medal-swap'
        }
      });
      
      console.log('✅ Registro de Lila creado en virgin_medals:');
      console.log(`   - ID: ${newLilaVirgin.id}`);
      console.log(`   - Status: ${newLilaVirgin.status}`);
      console.log(`   - Register Hash: ${newLilaVirgin.registerHash}`);
    }
    
    // Verificar el resultado final
    console.log('\n🔍 Verificando resultado final...');
    const finalLilaVirgin = await prisma.virginMedal.findFirst({
      where: { medalString: lilaMedalString }
    });
    
    if (finalLilaVirgin) {
      console.log('✅ Lila en virgin_medals:');
      console.log(`   - ID: ${finalLilaVirgin.id}`);
      console.log(`   - Status: ${finalLilaVirgin.status}`);
      console.log(`   - Register Hash: ${finalLilaVirgin.registerHash}`);
    } else {
      console.log('❌ ERROR: Lila no encontrada después de la corrección');
    }
    
    console.log('\n🎉 CORRECCIÓN COMPLETADA!');
    console.log('   - Lila ahora debería funcionar correctamente');
    console.log('   - La chapita "lila" apunta a la mascota "pamela"');
    
  } catch (error) {
    console.error('❌ Error corrigiendo Lila:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixLilaVirginMedal();






