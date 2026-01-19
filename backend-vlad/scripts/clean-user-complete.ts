import { PrismaClient, MedalState } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanUserComplete(email: string) {
  try {
    console.log(`🚀 Iniciando limpieza completa para usuario: ${email}`);
    console.log('='.repeat(60));
    
    // 1. Buscar el usuario
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase()
      },
      include: {
        medals: true
      }
    });

    if (!user) {
      console.log(`❌ No se encontró el usuario: ${email}`);
      return;
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Username: ${user.username || 'No especificado'}`);
    console.log(`   - Teléfono: ${user.phonenumber || 'No especificado'}`);
    console.log(`   - Estado: ${user.userStatus}`);
    
    if (user.medals) {
      console.log(`   - Cantidad de medallas: ${user.medals.length}`);
    } else {
      console.log(`   - Cantidad de medallas: 0 (necesita include)`);
    }

    // 2. Procesar cada medalla registrada
    if (user.medals && user.medals.length > 0) {
      console.log(`\n📋 Procesando ${user.medals.length} medalla(s) registrada(s):`);
      
      for (let i = 0; i < user.medals.length; i++) {
        const medal = user.medals[i];
        console.log(`\n   ${i + 1}. Procesando medalla: ${medal.medalString}`);
        
        // Obtener nombre del animal (ahora está directamente en la medalla)
        const animalName = medal.petName || 'Sin nombre';
        console.log(`      - Animal: ${animalName}`);
        console.log(`      - Status: ${medal.status}`);
        
        // Eliminar la medalla
        try {
          await prisma.medal.delete({
            where: { id: medal.id }
          });
          console.log(`      ✅ Medalla eliminada`);
        } catch (error: any) {
          if (error.code === 'P2025') {
            console.log(`      ⚠️  Medalla ya no existe`);
          } else {
            throw error;
          }
        }
        
        // Actualizar la virginMedal correspondiente
        const virginMedal = await prisma.virginMedal.findFirst({
          where: { medalString: medal.medalString }
        });
        
        if (virginMedal) {
          await prisma.virginMedal.update({
            where: { id: virginMedal.id },
            data: { 
              status: MedalState.VIRGIN,
              updatedAt: new Date()
            }
          });
          console.log(`      ✅ VirginMedal actualizada a estado VIRGIN`);
        } else {
          console.log(`      ⚠️  No se encontró virginMedal correspondiente`);
        }
      }
    }

    // 3. Eliminar el usuario
    console.log(`\n👤 Eliminando usuario...`);
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log(`✅ Usuario eliminado`);

    console.log('\n🎉 Limpieza completada exitosamente');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Función principal
async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Error: Debes proporcionar un email como argumento');
    console.log('Uso: npx ts-node scripts/clean-user-complete.ts <email>');
    process.exit(1);
  }

  try {
    await cleanUserComplete(email);
    console.log('✅ Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  }
}

// Ejecutar el script
main();

