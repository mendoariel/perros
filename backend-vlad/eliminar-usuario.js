const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function eliminarUsuario(email) {
  try {
    console.log('🔍 BUSCANDO USUARIO Y SUS DATOS...');
    console.log('=====================================');
    
    // 1. Buscar el usuario y sus medallas
    const user = await prisma.user.findFirst({
      where: {
        email: email
      },
      include: {
        medals: true
      }
    });

    if (!user) {
      console.log(`❌ Usuario no encontrado con email: ${email}`);
      return;
    }

    console.log('👤 USUARIO ENCONTRADO:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Username: ${user.username || 'No especificado'}`);
    console.log(`   - Rol: ${user.role}`);
    console.log(`   - Estado: ${user.userStatus}`);
    console.log(`   - Fecha de creación: ${user.createdAt}`);
    console.log('');

    console.log('🐕 MASCOTAS DEL USUARIO:');
    console.log('========================');
    
    if (user.medals.length === 0) {
      console.log('   - No tiene mascotas registradas');
    } else {
      user.medals.forEach((medal, index) => {
        console.log(`   ${index + 1}. ${medal.petName}`);
        console.log(`      - ID: ${medal.id}`);
        console.log(`      - Estado: ${medal.status}`);
        console.log(`      - Medal String: ${medal.medalString}`);
        console.log(`      - Register Hash: ${medal.registerHash}`);
        console.log(`      - Descripción: ${medal.description || 'Sin descripción'}`);
        console.log('');
      });
    }

    console.log('🔄 ACCIONES QUE SE VAN A REALIZAR:');
    console.log('===================================');
    console.log('1. ✅ Buscar registros en virgin_medals con los medal_string de las medallas del usuario');
    console.log('2. ✅ Actualizar esos registros de virgin_medals a status VIRGIN');
    console.log('3. ✅ Eliminar todas las medallas del usuario');
    console.log('4. ✅ Eliminar el usuario');
    console.log('');

    // 2. Buscar virgin medals que coincidan con las medallas del usuario
    const medalStrings = user.medals.map(medal => medal.medalString);
    const virginMedals = await prisma.virginMedal.findMany({
      where: {
        medalString: {
          in: medalStrings
        }
      }
    });

    console.log('🏆 VIRGIN MEDALS ENCONTRADAS:');
    console.log('=============================');
    
    if (virginMedals.length === 0) {
      console.log('   - No se encontraron virgin medals para restaurar');
    } else {
      virginMedals.forEach((virginMedal, index) => {
        console.log(`   ${index + 1}. Medal String: ${virginMedal.medalString}`);
        console.log(`      - ID: ${virginMedal.id}`);
        console.log(`      - Estado actual: ${virginMedal.status}`);
        console.log(`      - Register Hash: ${virginMedal.registerHash}`);
        console.log('');
      });
    }

    console.log('⚠️  ADVERTENCIA: Esta acción es IRREVERSIBLE');
    console.log('   Se eliminarán permanentemente:');
    console.log(`   - El usuario ${user.email}`);
    console.log(`   - ${user.medals.length} mascota(s)`);
    console.log(`   - Se restaurarán ${virginMedals.length} virgin medal(s) a estado VIRGIN`);
    console.log('');

    // EJECUTANDO LA ELIMINACIÓN REAL
    console.log('🔄 EJECUTANDO ELIMINACIÓN...');
    
    // 3. Actualizar virgin medals a VIRGIN
    if (virginMedals.length > 0) {
      await prisma.virginMedal.updateMany({
        where: {
          medalString: {
            in: medalStrings
          }
        },
        data: {
          status: 'VIRGIN'
        }
      });
      console.log(`✅ ${virginMedals.length} virgin medal(s) restaurada(s) a estado VIRGIN`);
    }

    // 4. Eliminar medallas del usuario
    if (user.medals.length > 0) {
      await prisma.medal.deleteMany({
        where: {
          ownerId: user.id
        }
      });
      console.log(`✅ ${user.medals.length} medalla(s) eliminada(s)`);
    }

    // 5. Eliminar usuario
    await prisma.user.delete({
      where: {
        id: user.id
      }
    });
    console.log(`✅ Usuario ${user.email} eliminado`);

    console.log('');
    console.log('🎉 ELIMINACIÓN COMPLETADA EXITOSAMENTE');

  } catch (error) {
    console.error('❌ Error durante la eliminación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener email desde argumentos de línea de comandos
const email = process.argv[2];

if (!email) {
  console.log('❌ Error: Debes proporcionar un email como argumento');
  console.log('   Uso: node eliminar-usuario.js <email>');
  console.log('   Ejemplo: node eliminar-usuario.js mendoariel@gmail.com');
  process.exit(1);
}

console.log(`🎯 ELIMINANDO USUARIO: ${email}`);
console.log('=====================================');
console.log('');

eliminarUsuario(email); 