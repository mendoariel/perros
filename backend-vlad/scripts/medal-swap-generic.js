const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Script genérico para intercambio de medal strings
 * 
 * USO:
 * node scripts/medal-swap-generic.js "medal_string_actual" "medal_string_nueva"
 * 
 * EJEMPLO:
 * node scripts/medal-swap-generic.js "y5ppbb0ai9xvqptygr0siq3edpviz7mh1bnm" "doc0hn8516yoevwirjpam5xefkoh4g26asc7"
 */

async function swapMedalStringsGeneric(registeredMedalString, virginMedalString) {
  try {
    console.log('🔄 INTERCAMBIO GENÉRICO DE MEDAL STRINGS\n');
    
    // Validar parámetros
    if (!registeredMedalString || !virginMedalString) {
      throw new Error('❌ Debe proporcionar ambos medal strings');
    }
    
    if (registeredMedalString === virginMedalString) {
      throw new Error('❌ Los medal strings no pueden ser iguales');
    }
    
    console.log('📋 Parámetros:');
    console.log(`   Medalla registrada: ${registeredMedalString}`);
    console.log(`   Medalla virgen: ${virginMedalString}\n`);
    
    // Verificar estado inicial
    console.log('🔍 Verificando estado inicial...');
    
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
    
    // Realizar intercambio
    console.log('🔄 Ejecutando intercambio...');
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Limpiar registro de medalla registrada en virgin_medals
      const existingVirginRegistered = await tx.virginMedal.findFirst({
        where: { medalString: registeredMedalString }
      });
      
      if (existingVirginRegistered) {
        await tx.virginMedal.delete({
          where: { id: existingVirginRegistered.id }
        });
        console.log('   ✅ Registro de medalla registrada eliminado de virgin_medals');
      }
      
      // 2. Actualizar medalla registrada
      const updatedRegisteredMedal = await tx.medal.update({
        where: { medalString: registeredMedalString },
        data: { medalString: virginMedalString }
      });
      console.log('   ✅ Medalla registrada actualizada');
      
      // 3. Actualizar medalla virgen
      const updatedVirginMedal = await tx.virginMedal.update({
        where: { medalString: virginMedalString },
        data: { 
          medalString: registeredMedalString,
          status: 'VIRGIN'
        }
      });
      console.log('   ✅ Medalla virgen actualizada');
      
      // 4. Crear nuevo registro en virgin_medals
      const newVirginMedal = await tx.virginMedal.create({
        data: {
          medalString: virginMedalString,
          status: 'ENABLED',
          registerHash: `swap-${Date.now()}`
        }
      });
      console.log('   ✅ Nuevo registro en virgin_medals creado');
      
      return {
        updatedRegisteredMedal,
        updatedVirginMedal,
        newVirginMedal
      };
    });
    
    console.log('\n✅ Intercambio completado!\n');
    
    // Verificar resultado
    console.log('🔍 Verificando resultado...');
    
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
    
    console.log('📊 RESULTADO:');
    console.log(`✅ Nueva medalla (${virginMedalString}): ${newMedalCheck?.petName} (${newMedalCheck?.owner?.email})`);
    console.log(`✅ Virgin medalla nueva: ${newVirginCheck?.status}`);
    console.log(`✅ Medalla original ahora virgen: ${oldMedalVirginCheck?.status}`);
    
    console.log('\n🎉 INTERCAMBIO EXITOSO!');
    console.log(`   - La medalla "${virginMedalString}" ahora apunta a "${newMedalCheck?.petName}"`);
    console.log(`   - La medalla "${registeredMedalString}" ahora está virgen`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log('❌ Uso incorrecto');
    console.log('📖 Uso: node scripts/medal-swap-generic.js "medal_string_actual" "medal_string_nueva"');
    console.log('📖 Ejemplo: node scripts/medal-swap-generic.js "abc123" "def456"');
    process.exit(1);
  }
  
  const [registeredMedalString, virginMedalString] = args;
  
  try {
    await swapMedalStringsGeneric(registeredMedalString, virginMedalString);
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script falló:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { swapMedalStringsGeneric };




