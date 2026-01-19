import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGetPet() {
  const medalString = 'lwdddp7p4spbzu1bor6fx8l0n1615886a30n';
  
  try {
    console.log(`🔍 Probando getPet para: ${medalString}`);
    console.log('='.repeat(60));
    
    // Simular la consulta que hace getPet (ahora los datos están directamente en Medal)
    const medal = await prisma.medal.findFirst({
      where: {
        medalString: medalString
      },
      include: {
        owner: true
      }
    });

    if(!medal) {
      console.log('❌ Medalla no encontrada');
      return;
    }

    if(!medal.owner) {
      console.log('❌ No tiene owner');
      return;
    }

    console.log('✅ Medalla encontrada');
    console.log(`   - Status: ${medal.status}`);
    console.log(`   - Owner: ${medal.owner.email}`);
    console.log('');

    if(!medal.petName) {
      console.log('⚠️ PROBLEMA: No hay nombre de mascota!');
      return;
    }

    console.log('🐾 Mascota encontrada (datos embebidos en Medal):');
    console.log(`   - Nombre: ${medal.petName || 'Sin nombre'}`);
    console.log(`   - Imagen: ${medal.image || 'Sin imagen'}`);
    console.log(`   - Descripción: ${medal.description || 'Sin descripción'}`);
    console.log(`   - Teléfono: ${medal.owner.phoneNumber || medal.owner.phonenumber || 'Sin teléfono'}`);
    console.log('');

    // Construir resultado como lo hace getPet (simplificado)
    const result = {
      petName: medal.petName || '',
      phone: medal.owner.phoneNumber || medal.owner.phonenumber || null,
      image: medal.image || null,
      description: medal.description || null
    };

    console.log('✅ Resultado construido:');
    console.log(JSON.stringify(result, null, 2));
    console.log('='.repeat(60));
    console.log('✅ Test completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testGetPet();

