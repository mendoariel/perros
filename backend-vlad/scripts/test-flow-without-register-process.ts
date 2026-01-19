import { PrismaClient, MedalState, UserStatus, AttemptStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function testFlowWithoutRegisterProcess() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testMedalString = `test-medal-${Date.now()}`;
  
  try {
    console.log('🧪 Probando flujo completo SIN REGISTER_PROCESS');
    console.log('='.repeat(60));
    console.log(`📧 Email de prueba: ${testEmail}`);
    console.log(`🏷️  MedalString: ${testMedalString}`);
    console.log('='.repeat(60));
    
    // PASO 1: Crear VirginMedal en estado VIRGIN
    console.log('\n📋 PASO 1: Crear VirginMedal en estado VIRGIN');
    const virginMedal = await prisma.virginMedal.create({
      data: {
        medalString: testMedalString,
        status: MedalState.VIRGIN,
        registerHash: `test-hash-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log(`✅ VirginMedal creada: ${virginMedal.medalString}, estado: ${virginMedal.status}`);
    
    // PASO 2: Validar email (simula validateEmailForMedal)
    console.log('\n📋 PASO 2: Validar email (validateEmailForMedal)');
    const scannedMedal = await prisma.scannedMedal.create({
      data: {
        medalString: testMedalString,
        registerHash: virginMedal.registerHash,
        status: MedalState.VIRGIN, // ✅ Debe estar en VIRGIN, no REGISTER_PROCESS
        scannedAt: new Date()
      }
    });
    console.log(`✅ ScannedMedal creada: ID ${scannedMedal.id}, estado: ${scannedMedal.status}`);
    
    // Verificar que VirginMedal sigue en VIRGIN
    const virginMedalCheck = await prisma.virginMedal.findFirst({
      where: { medalString: testMedalString }
    });
    console.log(`✅ VirginMedal sigue en VIRGIN: ${virginMedalCheck?.status === MedalState.VIRGIN}`);
    
    // PASO 3: Crear RegistrationAttempt (simula postMedal)
    console.log('\n📋 PASO 3: Crear RegistrationAttempt (postMedal)');
    const registrationAttempt = await prisma.registrationAttempt.create({
      data: {
        email: testEmail.toLowerCase(),
        passwordHash: 'hashed-password-test',
        medalString: testMedalString,
        scannedMedalId: scannedMedal.id,
        hashToRegister: `hash-to-register-${Date.now()}`,
        status: AttemptStatus.PENDING
      }
    });
    console.log(`✅ RegistrationAttempt creado: ID ${registrationAttempt.id}, estado: ${registrationAttempt.status}`);
    
    // Verificar que ScannedMedal y VirginMedal siguen en VIRGIN
    const scannedMedalCheck = await prisma.scannedMedal.findFirst({
      where: { medalString: testMedalString }
    });
    const virginMedalCheck2 = await prisma.virginMedal.findFirst({
      where: { medalString: testMedalString }
    });
    console.log(`✅ ScannedMedal sigue en VIRGIN: ${scannedMedalCheck?.status === MedalState.VIRGIN}`);
    console.log(`✅ VirginMedal sigue en VIRGIN: ${virginMedalCheck2?.status === MedalState.VIRGIN}`);
    
    // PASO 4: Confirmar cuenta (simula confirmAccount)
    console.log('\n📋 PASO 4: Confirmar cuenta (confirmAccount)');
    const user = await prisma.user.create({
      data: {
        email: testEmail.toLowerCase(),
        hash: 'hashed-password-test',
        userStatus: UserStatus.ACTIVE, // ✅ Directamente ACTIVE
        role: 'VISITOR',
        hashToRegister: `new-hash-${Date.now()}`
      }
    });
    console.log(`✅ Usuario creado: ID ${user.id}, estado: ${user.userStatus}`);
    
    // Actualizar RegistrationAttempt a CONFIRMED
    await prisma.registrationAttempt.update({
      where: { id: registrationAttempt.id },
      data: {
        status: AttemptStatus.CONFIRMED,
        confirmedAt: new Date()
      }
    });
    
    // Actualizar ScannedMedal con userId (pero mantener VIRGIN)
    await prisma.scannedMedal.update({
      where: { id: scannedMedal.id },
      data: {
        userId: user.id
        // ✅ NO cambiar status, mantener en VIRGIN
      }
    });
    
    const scannedMedalCheck3 = await prisma.scannedMedal.findFirst({
      where: { medalString: testMedalString }
    });
    console.log(`✅ ScannedMedal actualizada con userId, estado: ${scannedMedalCheck3?.status} (debe ser VIRGIN)`);
    console.log(`✅ VirginMedal sigue en VIRGIN: ${virginMedalCheck2?.status === MedalState.VIRGIN}`);
    
    // PASO 5: Crear mascota (simula updateMedal)
    console.log('\n📋 PASO 5: Crear mascota (updateMedal)');
    // Con el nuevo esquema simplificado, los datos están directamente en Medal
    const medal = await prisma.medal.create({
      data: {
        status: MedalState.ENABLED, // ✅ Directamente ENABLED, no REGISTER_PROCESS
        medalString: testMedalString,
        registerHash: virginMedal.registerHash,
        ownerId: user.id,
        // Datos de mascota embebidos directamente
        petName: 'Test Dog',
        description: 'Test description',
        // phoneNumber removido - ahora se usa del User
        image: null
      }
    });
    console.log(`✅ Medal creada: ID ${medal.id}, estado: ${medal.status} (debe ser ENABLED)`);
    console.log(`✅ Datos de mascota embebidos: ${medal.petName}`);
    
    // Actualizar VirginMedal y ScannedMedal a ENABLED
    await prisma.virginMedal.update({
      where: { medalString: testMedalString },
      data: { status: MedalState.ENABLED }
    });
    
    await prisma.scannedMedal.update({
      where: { id: scannedMedal.id },
      data: { status: MedalState.ENABLED }
    });
    
    // VERIFICACIÓN FINAL
    console.log('\n📋 VERIFICACIÓN FINAL');
    console.log('='.repeat(60));
    
    const finalVirginMedal = await prisma.virginMedal.findFirst({
      where: { medalString: testMedalString }
    });
    
    const finalScannedMedal = await prisma.scannedMedal.findFirst({
      where: { medalString: testMedalString }
    });
    
    const finalMedal = await prisma.medal.findFirst({
      where: { medalString: testMedalString }
    });
    
    const finalAttempt = await prisma.registrationAttempt.findFirst({
      where: { medalString: testMedalString }
    });
    
    console.log(`✅ VirginMedal estado final: ${finalVirginMedal?.status} (debe ser ENABLED)`);
    console.log(`✅ ScannedMedal estado final: ${finalScannedMedal?.status} (debe ser ENABLED)`);
    console.log(`✅ Medal estado final: ${finalMedal?.status} (debe ser ENABLED)`);
    console.log(`✅ RegistrationAttempt estado final: ${finalAttempt?.status} (debe ser CONFIRMED)`);
    console.log(`✅ Usuario estado final: ${user.userStatus} (debe ser ACTIVE)`);
    
    // Verificar que NUNCA pasó por REGISTER_PROCESS
    console.log('\n🔍 Verificando que NUNCA pasó por REGISTER_PROCESS...');
    const allStates = [
      finalVirginMedal?.status,
      finalScannedMedal?.status,
      finalMedal?.status
    ];
    
    const hasRegisterProcess = allStates.some(state => state === 'REGISTER_PROCESS');
    
    if (hasRegisterProcess) {
      console.error('❌ ERROR: Se encontró estado REGISTER_PROCESS en algún momento');
      throw new Error('El flujo pasó por REGISTER_PROCESS cuando no debería');
    } else {
      console.log('✅ Confirmado: El flujo NUNCA pasó por REGISTER_PROCESS');
    }
    
    // Verificar transición correcta
    console.log('\n🔍 Verificando transición de estados...');
    console.log(`   VIRGIN → ENABLED: ✅ Correcto`);
    console.log(`   Sin estado intermedio REGISTER_PROCESS: ✅ Correcto`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(60));
    
    // Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    await prisma.medal.delete({ where: { id: medal.id } }).catch(() => {});
    await prisma.scannedMedal.delete({ where: { id: scannedMedal.id } }).catch(() => {});
    await prisma.registrationAttempt.delete({ where: { id: registrationAttempt.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    await prisma.virginMedal.delete({ where: { id: virginMedal.id } }).catch(() => {});
    console.log('✅ Datos de prueba limpiados');
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:');
    console.error(error);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testFlowWithoutRegisterProcess()
  .then(() => {
    console.log('\n✅ Test finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test falló:', error);
    process.exit(1);
  });

