import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEndpointDirect() {
  const medalString = 'lwdddp7p4spbzu1bor6fx8l0n1615886a30n';
  
  try {
    console.log(`🔍 Probando endpoint directamente para: ${medalString}`);
    console.log('='.repeat(60));
    
    // Simular exactamente lo que hace getPet (ahora los datos están directamente en Medal)
    const medal = await prisma.medal.findFirst({
      where: {
        medalString: medalString
      },
      include: {
        owner: true
      }
    });

    if(!medal) {
      console.error(`[getPet] Medalla no encontrada: ${medalString}`);
      throw new Error('No records for this medal');
    }
    
    if(!medal.owner) {
      console.error(`[getPet] Medalla sin owner: ${medalString}, medalId: ${medal.id}`);
      throw new Error('No user for this medal');
    }

    if(!medal.petName) {
      console.error(`[getPet] Medalla sin nombre de mascota: ${medalString}, medalId: ${medal.id}`);
      throw new Error('No se encontró información del animal asociado a esta medalla');
    }

    // Los datos del animal están directamente en la medalla
    const result = {
      petName: medal.petName || '',
      phone: medal.owner.phoneNumber || medal.owner.phonenumber || null,
      image: medal.image || null,
      description: medal.description || null
    };

    console.log('✅ Resultado:');
    console.log(JSON.stringify(result, null, 2));
    console.log('='.repeat(60));
    console.log('✅ Test completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testEndpointDirect();

