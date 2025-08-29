const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findUserMedals(email) {
  try {
    console.log(`🔍 Buscando usuario: ${email}`);
    
    // Buscar el usuario
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
    console.log(`   - Nombre: ${user.name}`);
    console.log(`   - Teléfono: ${user.phonenumber}`);
    console.log(`   - Cantidad de medallas: ${user.medals.length}`);

    if (user.medals.length > 0) {
      console.log(`\n📋 Medallas del usuario:`);
      user.medals.forEach((medal, index) => {
        console.log(`   ${index + 1}. MedalString: ${medal.medalString}`);
        console.log(`      - Pet Name: ${medal.petName}`);
        console.log(`      - Status: ${medal.status}`);
        console.log(`      - ID: ${medal.id}`);
        console.log('');
      });
    } else {
      console.log(`ℹ️  El usuario no tiene medallas registradas`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener el email desde los argumentos de línea de comandos
const email = process.argv[2];

if (!email) {
  console.log('❌ Por favor proporciona un email como argumento');
  console.log('Uso: node find-user-medals.js <email>');
  process.exit(1);
}

findUserMedals(email);
