const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Script completo para intercambiar medal strings entre dos medallas
 * 
 * USO:
 * node scripts/swap-medal-strings-complete.js
 * 
 * Este script:
 * 1. Intercambia los medalString entre una medalla registrada y una virgen
 * 2. Mantiene todos los datos de la mascota
 * 3. Asegura que ambas medallas queden en el estado correcto
 * 4. Maneja correctamente las tablas medals y virgin_medals
 */

async function swapMedalStringsComplete(registeredMedalString, virginMedalString) {
  try {
    console.log('🔄 INICIANDO INTERCAMBIO COMPLETO DE MEDAL STRINGS\n');
    
    console.log('📋 Parámetros:');
    console.log(`   Medalla registrada (actual): ${registeredMedalString}`);
    console.log(`   Medalla virgen (nueva): ${virginMedalString}\n`);
    
    // PASO 1: Verificar estado inicial
    console.log('🔍 PASO 1: Verificando estado inicial...');
    
    const registeredMedal = await prisma.medal.findFirst({
      where: { medalString: registeredMedalString },
      include: { owner: true }
    });
    
    const virginMedal = await prisma.virginMedal.findFirst({
      where: { medalString: virginMedalString }
    });
    
    if (!registeredMedal) {
      throw new Error(`❌ Medalla registrada no encontrada: ${registeredMedalString}`);
    }
    
    if (!virginMedal) {
      throw new Error(`❌ Medalla virgen no encontrada: ${virginMedalString}`);
    }
    
    console.log('✅ Estado inicial verificado:');
    console.log(`   - Medalla registrada: ${registeredMedal.petName} (${registeredMedal.owner?.email})`);
    console.log(`   - Medalla virgen: ${virginMedal.status}\n`);
    
    // PASO 2: Realizar intercambio en transacción
    console.log('🔄 PASO 2: Ejecutando intercambio en transacción...');
    
    const result = await prisma.$transaction(async (tx) => {
      // 2.1. Eliminar registro de la medalla registrada en virgin_medals (si existe)
      console.log('   2.1. Limpiando registro de medalla registrada en virgin_medals...');
      const existingVirginRegistered = await tx.virginMedal.findFirst({
        where: { medalString: registeredMedalString }
      });
      
      if (existingVirginRegistered) {
        await tx.virginMedal.delete({
          where: { id: existingVirginRegistered.id }
        });
        console.log(`      ✅ Registro eliminado: ID ${existingVirginRegistered.id}`);
      } else {
        console.log('      ℹ️  No había registro en virgin_medals');
      }
      
      // 2.2. Actualizar medalla registrada para usar el medalString de la virgen
      console.log('   2.2. Actualizando medalla registrada...');
      const updatedRegisteredMedal = await tx.medal.update({
        where: { medalString: registeredMedalString },
        data: { medalString: virginMedalString }
      });
      console.log(`      ✅ Medalla actualizada: ID ${updatedRegisteredMedal.id}`);
      
      // 2.3. Actualizar medalla virgen para usar el medalString de la registrada
      console.log('   2.3. Actualizando medalla virgen...');
      const updatedVirginMedal = await tx.virginMedal.update({
        where: { medalString: virginMedalString },
        data: { 
          medalString: registeredMedalString,
          status: 'VIRGIN' // Asegurar que quede virgen
        }
      });
      console.log(`      ✅ Virgin medalla actualizada: ID ${updatedVirginMedal.id}`);
      
      // 2.4. Crear nuevo registro en virgin_medals para la nueva medalla
      console.log('   2.4. Creando registro en virgin_medals para nueva medalla...');
      const newVirginMedal = await tx.virginMedal.create({
        data: {
          medalString: virginMedalString,
          status: 'ENABLED',
          registerHash: `swap-${Date.now()}`
        }
      });
      console.log(`      ✅ Nuevo registro creado: ID ${newVirginMedal.id}`);
      
      return {
        updatedRegisteredMedal,
        updatedVirginMedal,
        newVirginMedal
      };
    });
    
    console.log('\n✅ Intercambio completado exitosamente!\n');
    
    // PASO 3: Verificar resultado
    console.log('🔍 PASO 3: Verificando resultado...');
    
    // Verificar que la nueva medalla funciona
    const newMedalCheck = await prisma.medal.findFirst({
      where: { medalString: virginMedalString },
      include: { owner: true }
    });
    
    const newVirginCheck = await prisma.virginMedal.findFirst({
      where: { medalString: virginMedalString }
    });
    
    const oldMedalVirginCheck = await prisma.virginMedal.findFirst({
      where: { medalString: registeredMedalString }
    });
    
    console.log('\n📊 RESULTADO FINAL:');
    
    if (newMedalCheck) {
      console.log(`✅ Nueva medalla (${virginMedalString}):`);
      console.log(`   - Pet Name: ${newMedalCheck.petName}`);
      console.log(`   - Status: ${newMedalCheck.status}`);
      console.log(`   - Owner: ${newMedalCheck.owner?.email}`);
    } else {
      console.log(`❌ ERROR: Nueva medalla no encontrada`);
    }
    
    if (newVirginCheck) {
      console.log(`✅ Virgin medalla nueva: ${newVirginCheck.status}`);
    } else {
      console.log(`❌ ERROR: Virgin medalla nueva no encontrada`);
    }
    
    if (oldMedalVirginCheck) {
      console.log(`✅ Medalla original ahora virgen: ${oldMedalVirginCheck.status}`);
    } else {
      console.log(`❌ ERROR: Medalla original no encontrada en virgin_medals`);
    }
    
    console.log('\n🎉 INTERCAMBIO COMPLETADO EXITOSAMENTE!');
    console.log(`   - La medalla "${virginMedalString}" ahora apunta a "${newMedalCheck?.petName}"`);
    console.log(`   - La medalla "${registeredMedalString}" ahora está virgen`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error durante el intercambio:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Función para ejecutar con parámetros específicos
async function executeSwap() {
  // CONFIGURAR AQUÍ LOS MEDAL STRINGS
  const REGISTERED_MEDAL_STRING = 'y5ppbb0ai9xvqptygr0siq3edpviz7mh1bnm'; // Medalla actual (pamela)
  const VIRGIN_MEDAL_STRING = 'doc0hn8516yoevwirjpam5xefkoh4g26asc7';     // Medalla nueva (lila)
  
  try {
    await swapMedalStringsComplete(REGISTERED_MEDAL_STRING, VIRGIN_MEDAL_STRING);
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script falló:', error);
    process.exit(1);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  executeSwap();
}

module.exports = { swapMedalStringsComplete };




