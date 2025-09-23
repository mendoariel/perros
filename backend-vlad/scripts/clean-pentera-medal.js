const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanPenteraMedal() {
  try {
    console.log('🔍 Buscando mascota "pentera" del usuario mendoariel@hotmail.com...');
    
    // 1. Buscar el usuario
    const user = await prisma.user.findFirst({
      where: {
        email: 'mendoariel@hotmail.com'
      },
      include: {
        medals: true
      }
    });

    if (!user) {
      console.log('❌ No se encontró el usuario mendoariel@hotmail.com');
      return;
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Medallas: ${user.medals.length}`);

    // 2. Buscar la medalla "pentera"
    const penteraMedal = user.medals.find(medal => 
      medal.petName.toLowerCase().includes('pentera')
    );

    if (!penteraMedal) {
      console.log('❌ No se encontró la medalla "pentera"');
      console.log('📋 Medallas del usuario:');
      user.medals.forEach(medal => {
        console.log(`   - ${medal.petName} (${medal.medalString})`);
      });
      return;
    }

    console.log(`✅ Medalla "pentera" encontrada:`);
    console.log(`   - ID: ${penteraMedal.id}`);
    console.log(`   - Pet Name: ${penteraMedal.petName}`);
    console.log(`   - Medal String: ${penteraMedal.medalString}`);
    console.log(`   - Status: ${penteraMedal.status}`);
    console.log(`   - Register Hash: ${penteraMedal.registerHash}`);

    // 3. Verificar si el usuario tiene otras medallas
    const userMedalsCount = user.medals.length;
    console.log(`📊 El usuario tiene ${userMedalsCount} medalla(s) en total`);

    // 4. Usar transacción para eliminar medalla y restaurar virgin_medal
    console.log(`🔄 Iniciando transacción...`);
    
    const result = await prisma.$transaction(async (tx) => {
      // Eliminar la medalla
      console.log(`🗑️ Eliminando medalla...`);
      await tx.medal.delete({
        where: {
          id: penteraMedal.id
        }
      });
      console.log(`✅ Medalla eliminada`);

      // Actualizar virginMedal a estado VIRGIN
      console.log(`🔄 Actualizando virginMedal a estado VIRGIN...`);
      const virginMedal = await tx.virginMedal.findFirst({
        where: {
          medalString: penteraMedal.medalString
        }
      });

      if (virginMedal) {
        await tx.virginMedal.update({
          where: {
            id: virginMedal.id
          },
          data: {
            status: 'VIRGIN',
            updatedAt: new Date()
          }
        });
        console.log(`✅ VirginMedal actualizada a estado VIRGIN`);
      } else {
        console.log(`⚠️ No se encontró virginMedal para ${penteraMedal.medalString}`);
      }

      return { medalDeleted: true, virginRestored: !!virginMedal };
    });

    // 5. Si el usuario no tiene otras medallas, eliminarlo
    if (userMedalsCount === 1) {
      console.log(`👤 Usuario sin medallas, eliminando usuario...`);
      await prisma.user.delete({
        where: {
          id: user.id
        }
      });
      console.log(`✅ Usuario eliminado`);
    } else {
      console.log(`👤 Usuario tiene otras medallas, manteniendo usuario`);
    }

    console.log(`\n🎉 Operación completada exitosamente:`);
    console.log(`   ✅ Medalla "pentera" eliminada`);
    console.log(`   ✅ VirginMedal restaurada a estado VIRGIN`);
    if (userMedalsCount === 1) {
      console.log(`   ✅ Usuario eliminado (no tenía otras medallas)`);
    } else {
      console.log(`   ✅ Usuario mantenido (tiene otras medallas)`);
    }

  } catch (error) {
    console.error('❌ Error durante la operación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
cleanPenteraMedal()
  .then(() => {
    console.log('\n✅ Script ejecutado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando script:', error);
    process.exit(1);
  });


