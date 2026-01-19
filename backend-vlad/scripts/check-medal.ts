import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMedal() {
  const medalString = 'lwdddp7p4spbzu1bor6fx8l0n1615886a30n';
  
  try {
    console.log(`🔍 Verificando medalla: ${medalString}`);
    console.log('='.repeat(60));
    
    const medal = await prisma.medal.findFirst({
      where: { medalString },
      include: {
        owner: true
      }
    });
    
    if (!medal) {
      console.log('❌ Medalla no encontrada');
      return;
    }
    
    console.log('✅ Medalla encontrada:');
    console.log(`   - ID: ${medal.id}`);
    console.log(`   - Status: ${medal.status}`);
    console.log(`   - Owner ID: ${medal.ownerId}`);
    
    // Obtener owner si está incluido
    const owner = medal.owner;
    if (owner) {
      console.log(`   - Owner: ${owner.email}`);
    } else {
      console.log(`   - Owner: NO TIENE OWNER (necesita include)`);
    }
    
    console.log('');
    
    // Los datos del animal están directamente en la medalla
    if (medal.petName) {
      console.log('🐾 Animal asociado (datos embebidos en Medal):');
      console.log(`   - Pet Name: ${medal.petName}`);
      console.log(`   - Imagen: ${medal.image || 'Sin imagen'}`);
      console.log(`   - Descripción: ${medal.description || 'Sin descripción'}`);
      console.log(`   - Teléfono: ${medal.owner.phoneNumber || medal.owner.phonenumber || 'Sin teléfono'}`);
    } else {
      console.log('⚠️ PROBLEMA: La medalla NO tiene información del animal!');
      console.log('   Esto causará un error 500 en el endpoint getPet');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMedal();

