const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function swapMedalStrings() {
  try {
    console.log('🔄 Iniciando intercambio de medal strings...\n');
    
    // Medal strings
    const pamelaMedalString = 'y5ppbb0ai9xvqptygr0siq3edpviz7mh1bnm';
    const lilaMedalString = 'doc0hn8516yoevwirjpam5xefkoh4g26asc7';
    
    console.log('📋 Medal Strings:');
    console.log(`   Pamela (actual): ${pamelaMedalString}`);
    console.log(`   Lila (nueva): ${lilaMedalString}\n`);
    
    // Verificar estado antes del cambio
    console.log('🔍 Verificando estado antes del cambio...');
    
    const pamelaMedalBefore = await prisma.medal.findFirst({
      where: { medalString: pamelaMedalString },
      include: { owner: true }
    });
    
    const lilaVirginMedalBefore = await prisma.virginMedal.findFirst({
      where: { medalString: lilaMedalString }
    });
    
    if (!pamelaMedalBefore) {
      throw new Error('❌ Medalla de Pamela no encontrada en medals');
    }
    
    if (!lilaVirginMedalBefore) {
      throw new Error('❌ Medalla de Lila no encontrada en virgin_medals');
    }
    
    console.log('✅ Estado verificado correctamente\n');
    
    // Realizar el intercambio en una transacción
    console.log('🔄 Ejecutando intercambio en transacción...');
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Primero, eliminar el registro de Pamela en virgin_medals (ya que va a quedar virgen)
      console.log('   1. Eliminando registro de Pamela en virgin_medals...');
      const pamelaVirginMedal = await tx.virginMedal.findFirst({
        where: { medalString: pamelaMedalString }
      });
      
      if (pamelaVirginMedal) {
        await tx.virginMedal.delete({
          where: { id: pamelaVirginMedal.id }
        });
        console.log(`      ✅ Virgin medalla de Pamela eliminada: ID ${pamelaVirginMedal.id}`);
      }
      
      // 2. Actualizar la medalla de Pamela en medals para que use el medalString de Lila
      console.log('   2. Actualizando medalla de Pamela en medals...');
      const updatedPamelaMedal = await tx.medal.update({
        where: { medalString: pamelaMedalString },
        data: { medalString: lilaMedalString }
      });
      console.log(`      ✅ Medalla actualizada: ID ${updatedPamelaMedal.id}`);
      
      // 3. Actualizar la medalla de Lila en virgin_medals para que use el medalString de Pamela
      console.log('   3. Actualizando medalla de Lila en virgin_medals...');
      const updatedLilaVirginMedal = await tx.virginMedal.update({
        where: { medalString: lilaMedalString },
        data: { 
          medalString: pamelaMedalString,
          status: 'VIRGIN' // Asegurar que quede como virgen
        }
      });
      console.log(`      ✅ Virgin medalla actualizada: ID ${updatedLilaVirginMedal.id}`);
      
      return {
        pamelaMedal: updatedPamelaMedal,
        lilaVirginMedal: updatedLilaVirginMedal
      };
    });
    
    console.log('\n✅ Intercambio completado exitosamente!\n');
    
    // Verificar el resultado
    console.log('🔍 Verificando resultado del intercambio...');
    
    // Ahora Lila debería estar en medals (con los datos de Pamela)
    const lilaMedalAfter = await prisma.medal.findFirst({
      where: { medalString: lilaMedalString },
      include: { owner: true }
    });
    
    // Ahora Pamela debería estar en virgin_medals como VIRGIN
    const pamelaVirginMedalAfter = await prisma.virginMedal.findFirst({
      where: { medalString: pamelaMedalString }
    });
    
    console.log('\n📊 RESULTADO DEL INTERCAMBIO:');
    
    if (lilaMedalAfter) {
      console.log('✅ Lila ahora está en medals (con datos de Pamela):');
      console.log(`   - Pet Name: ${lilaMedalAfter.petName}`);
      console.log(`   - Status: ${lilaMedalAfter.status}`);
      console.log(`   - Owner Email: ${lilaMedalAfter.owner?.email}`);
      console.log(`   - Description: ${lilaMedalAfter.description}`);
    } else {
      console.log('❌ ERROR: Lila no encontrada en medals después del intercambio');
    }
    
    if (pamelaVirginMedalAfter) {
      console.log('✅ Pamela ahora está en virgin_medals como VIRGIN:');
      console.log(`   - Status: ${pamelaVirginMedalAfter.status}`);
      console.log(`   - Register Hash: ${pamelaVirginMedalAfter.registerHash}`);
    } else {
      console.log('❌ ERROR: Pamela no encontrada en virgin_medals después del intercambio');
    }
    
    console.log('\n🎉 INTERCAMBIO COMPLETADO EXITOSAMENTE!');
    console.log('   - La chapita "lila" ahora apunta a la mascota "pamela"');
    console.log('   - La chapita "pamela" ahora está virgen');
    
  } catch (error) {
    console.error('❌ Error durante el intercambio:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  swapMedalStrings()
    .then(() => {
      console.log('\n✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script falló:', error);
      process.exit(1);
    });
}

module.exports = { swapMedalStrings };
