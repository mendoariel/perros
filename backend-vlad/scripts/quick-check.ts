// Script rápido para verificar que Prisma Client está actualizado
// No se conecta a la base de datos, solo verifica los enums

try {
    const { AttemptStatus, MedalState } = require('@prisma/client');
    
    console.log('✅ AttemptStatus disponible:');
    console.log('   PENDING:', AttemptStatus.PENDING);
    console.log('   CONFIRMED:', AttemptStatus.CONFIRMED);
    console.log('   EXPIRED:', AttemptStatus.EXPIRED);
    
    console.log('\n✅ MedalState disponible:');
    console.log('   VIRGIN:', MedalState.VIRGIN);
    console.log('   ENABLED:', MedalState.ENABLED);
    
    console.log('\n✅ Prisma Client está actualizado correctamente!');
    process.exit(0);
} catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('Cannot find module')) {
        console.error('\n⚠️  PROBLEMA: Prisma Client no está generado');
        console.error('   Solución: Ejecuta "npx prisma generate"');
    }
    
    if (error.message.includes('AttemptStatus')) {
        console.error('\n⚠️  PROBLEMA: AttemptStatus no está disponible');
        console.error('   Solución: Ejecuta "npx prisma generate"');
    }
    
    process.exit(1);
}

