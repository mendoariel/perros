const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanMedal(medalString) {
  try {
    console.log(`🔍 Buscando medalla: ${medalString}`);
    
    // 1. Buscar la medalla
    const medal = await prisma.medal.findFirst({
      where: {
        medalString: medalString
      },
      include: {
        owner: true
      }
    });

    if (!medal) {
      console.log(`❌ No se encontró la medalla: ${medalString}`);
      return;
    }

    console.log(`✅ Medalla encontrada:`);
    console.log(`   - ID: ${medal.id}`);
    console.log(`   - Pet Name: ${medal.petName}`);
    console.log(`   - Owner ID: ${medal.ownerId}`);
    console.log(`   - Owner Email: ${medal.owner?.email}`);

    // 2. Verificar si el usuario tiene otras medallas
    const userMedalsCount = await prisma.medal.count({
      where: {
        ownerId: medal.ownerId
      }
    });

    console.log(`📊 El usuario tiene ${userMedalsCount} medalla(s) en total`);

    // 3. Eliminar la medalla
    console.log(`🗑️ Eliminando medalla...`);
    await prisma.medal.delete({
      where: {
        id: medal.id
      }
    });
    console.log(`✅ Medalla eliminada`);

    // 4. Si el usuario no tiene otras medallas, eliminarlo
    if (userMedalsCount === 1) {
      console.log(`👤 Usuario sin medallas, eliminando usuario...`);
      await prisma.user.delete({
        where: {
          id: medal.ownerId
        }
      });
      console.log(`✅ Usuario eliminado`);
    } else {
      console.log(`👤 Usuario tiene otras medallas, manteniendo usuario`);
    }

    // 5. Actualizar virginMedal a estado VIRGIN
    console.log(`🔄 Actualizando virginMedal a estado VIRGIN...`);
    const virginMedal = await prisma.virginMedal.findFirst({
      where: {
        medalString: medalString
      }
    });

    if (virginMedal) {
      await prisma.virginMedal.update({
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
      console.log(`⚠️ No se encontró virginMedal para: ${medalString}`);
    }

    console.log(`🎉 Limpieza completada exitosamente para: ${medalString}`);

  } catch (error) {
    console.error(`❌ Error durante la limpieza:`, error);
    throw error;
  }
}

// Función principal
async function main() {
  const medalString = process.argv[2];
  
  if (!medalString) {
    console.error('❌ Error: Debes proporcionar un medalString como argumento');
    console.log('Uso: node clean-medal.js <medalString>');
    process.exit(1);
  }

  console.log(`🚀 Iniciando limpieza para medalla: ${medalString}`);
  console.log('=' .repeat(50));

  try {
    await cleanMedal(medalString);
    console.log('=' .repeat(50));
    console.log('✅ Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
main();
