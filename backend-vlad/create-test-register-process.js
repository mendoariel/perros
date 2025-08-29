const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestRegisterProcess() {
  try {
    console.log('🚀 Creando datos de prueba para REGISTER_PROCESS...');

    // 1. Crear un usuario con estado PENDING
    const testUser = await prisma.user.create({
      data: {
        email: 'test-register-process-' + Date.now() + '@example.com',
        hash: '$2b$10$test.hash.for.testing.purposes',
        hashToRegister: 'test-register-hash-' + Date.now(),
        userStatus: 'PENDING',
        role: 'REGISTER',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Usuario creado:', testUser.email);

    // 2. Crear una medalla en VirginMedal con estado REGISTER_PROCESS
    const testMedalString = 'test-register-process-medal-' + Date.now();
    
    const virginMedal = await prisma.virginMedal.create({
      data: {
        medalString: testMedalString,
        status: 'REGISTER_PROCESS',
        registerHash: 'test-hash-' + Date.now(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ VirginMedal creada:', virginMedal.medalString);

    // 3. Crear una medalla en Medal asociada al usuario
    const medal = await prisma.medal.create({
      data: {
        medalString: testMedalString,
        status: 'REGISTER_PROCESS',
        petName: 'Test Pet',
        registerHash: 'test-register-hash-' + Date.now(),
        ownerId: testUser.id,
        createAt: new Date(),
        updateAt: new Date()
      }
    });

    console.log('✅ Medal creada y asociada al usuario');

    // 4. Verificar que todo se creó correctamente
    const virginMedalVerification = await prisma.virginMedal.findFirst({
      where: { medalString: testMedalString }
    });

    const medalVerification = await prisma.medal.findFirst({
      where: { medalString: testMedalString },
      include: {
        owner: true
      }
    });

    console.log('\n📋 Resumen de datos creados:');
    console.log('MedalString:', testMedalString);
    console.log('Usuario:', medalVerification.owner.email);
    console.log('Estado VirginMedal:', virginMedalVerification.status);
    console.log('Estado Medal:', medalVerification.status);
    console.log('Estado Usuario:', medalVerification.owner.userStatus);

    console.log('\n🎯 Para probar, usa este medalString en el frontend:');
    console.log(testMedalString);

    return {
      medalString: testMedalString,
      userEmail: testUser.email,
      virginMedalStatus: virginMedalVerification.status,
      medalStatus: medalVerification.status,
      userStatus: medalVerification.owner.userStatus
    };

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
createTestRegisterProcess()
  .then((result) => {
    console.log('\n✅ Datos de prueba creados exitosamente!');
    console.log('Puedes usar el medalString para probar el flujo REGISTER_PROCESS');
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
