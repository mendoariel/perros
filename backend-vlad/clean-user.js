const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanUser(email) {
  try {
    console.log(`🚀 Iniciando limpieza para usuario: ${email}`);
    console.log('==================================================');
    
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
      console.log(`❌ No se encontró el usuario: ${email}`);
      return;
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Nombre: ${user.name || 'No especificado'}`);
    console.log(`   - Teléfono: ${user.phonenumber}`);
    console.log(`   - Cantidad de medallas: ${user.medals.length}`);

    if (user.medals.length === 0) {
      console.log(`ℹ️  El usuario no tiene medallas, eliminando solo el usuario...`);
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log(`✅ Usuario eliminado`);
      return;
    }

    // 2. Procesar cada medalla
    console.log(`\n📋 Procesando ${user.medals.length} medalla(s):`);
    
    for (let i = 0; i < user.medals.length; i++) {
      const medal = user.medals[i];
      console.log(`\n   ${i + 1}. Procesando medalla: ${medal.medalString}`);
      console.log(`      - Pet Name: ${medal.petName}`);
      console.log(`      - Status: ${medal.status}`);
      
      // Eliminar la medalla
      await prisma.medal.delete({
        where: { id: medal.id }
      });
      console.log(`      ✅ Medalla eliminada`);
      
      // Actualizar la virginMedal correspondiente
      const virginMedal = await prisma.virginMedal.findFirst({
        where: { medalString: medal.medalString }
      });
      
      if (virginMedal) {
        await prisma.virginMedal.update({
          where: { id: virginMedal.id },
          data: { status: 'VIRGIN' }
        });
        console.log(`      ✅ VirginMedal actualizada a estado VIRGIN`);
      } else {
        console.log(`      ⚠️  No se encontró virginMedal correspondiente`);
      }
    }

    // 3. Eliminar el usuario
    console.log(`\n👤 Eliminando usuario...`);
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log(`✅ Usuario eliminado`);

    console.log('\n🎉 Limpieza completada exitosamente');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener el email desde los argumentos de línea de comandos
const email = process.argv[2];

if (!email) {
  console.log('❌ Por favor proporciona un email como argumento');
  console.log('Uso: node clean-user.js <email>');
  process.exit(1);
}

cleanUser(email);
