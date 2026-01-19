import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para clasificar mascotas en lote
 * Muestra todas las mascotas y permite clasificarlas con un objeto de configuración
 */

interface PetClassification {
  medalString: string;
  petName: string;
  type: 'DOG' | 'CAT' | 'OTHER' | null; // null = mantener como está
}

/**
 * NOTA: Este script está obsoleto con el nuevo esquema simplificado.
 * Los datos de mascotas ahora están embebidos directamente en Medal.
 * Este script ya no es necesario.
 */
async function migratePetToType(
  medalId: number,
  petId: number,
  petData: any,
  newType: 'DOG' | 'CAT'
) {
  console.log('⚠️  Este script está obsoleto con el nuevo esquema simplificado.');
  console.log('   Los datos de mascotas están embebidos directamente en Medal.');
  return { success: false, error: 'Script obsoleto' };
}

/**
 * Función principal
 */
async function classifyPetsBatch() {
  try {
    console.log('🔍 Clasificación de Mascotas en Lote');
    console.log('='.repeat(60));
    console.log('');

    // Con el nuevo esquema simplificado, los datos están directamente en Medal
    const medals = await prisma.medal.findMany({
      where: {
        petName: { not: '' }
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`📊 Encontradas ${medals.length} medallas con datos de mascota\n`);
    console.log('⚠️  NOTA: Este script está obsoleto con el nuevo esquema simplificado.');
    console.log('   Los datos de mascotas están embebidos directamente en Medal.\n');

    // Mostrar todas las mascotas
    console.log('📋 Lista de Mascotas:');
    console.log('-'.repeat(60));
    medals.forEach((medal, index) => {
      if (!medal.petName) return;
      const imageUrl = medal.image 
        ? `http://localhost:3335/pets/files/${medal.image}` 
        : 'Sin imagen';
      
      console.log(`${index + 1}. ${medal.petName}`);
      console.log(`   Medal: ${medal.medalString}`);
      console.log(`   Descripción: ${medal.description || 'Sin descripción'}`);
      console.log(`   Imagen: ${imageUrl}`);
      console.log('');
    });

    // ============================================
    // CLASIFICACIONES BASADAS EN DESCRIPCIONES
    // ============================================
    const classifications: Record<string, 'DOG' | 'CAT' | 'OTHER' | null> = {
      // GATOS (claramente identificados)
      'celeste': 'CAT',  // Silvestre - "Gato macho adulto color vaquita"
      'pumita93': 'CAT',  // Pumita - "Gato vaquita de la cuarta seccion"
      
      // PERROS (claramente identificados por descripción)
      '7elfvrp69eexyqviweafrrckcgp9wj9ao0mn': 'DOG',  // Robin - "Soy un perrito perdido"
      '47kjcx5ox3bc91f3mg7mwdolpaqigro2opsh': 'DOG',  // Luli - "Canche toy blanco"
      'o86c320roj50qstp2y76x3d9slma8g7u2v3r': 'DOG',  // Aukan - "Perro mediano"
      't75kly5rf7zkngcjvka31zyltnni3nerdevy': 'DOG',  // Champucito - "Caniche chico"
      'qlp5dgnztepx96slvi2q2oo096c1u9axwiwi': 'DOG',  // Ramon - "Perro macho"
      '7eo1ts2pjcnm2yr1xnzs9t7p7zdocn5wub5u': 'DOG',  // Panchita - "Perra tamaño mediano"
      '862sqexgamm0c5j1s218cz14sdyrtky9uuwo': 'DOG',  // Lio - "Perro macho de raza salchicha"
      '10f1kbmemzpxzrt32qt63ab8xlur5crbbymr': 'DOG',  // Moon - "Caniche de 5 años"
      'test-register-process-medal-1755888680961': 'DOG',  // Tere - "Excelente, es puro amor esta perra"
      'lwdddp7p4spbzu1bor6fx8l0n1615886a30n': 'DOG',  // Martes - "El champusito es el perro mas lindo"
    };

    console.log('='.repeat(60));
    console.log('⚙️ Configuración de Clasificaciones:');
    console.log('Edita el objeto "classifications" en el script para clasificar');
    console.log('='.repeat(60));
    console.log('');

    // Verificar si hay clasificaciones configuradas
    const hasClassifications = Object.keys(classifications).length > 0;
    
    if (!hasClassifications) {
      console.log('ℹ️ No hay clasificaciones configuradas.');
      console.log('   Edita el script y agrega las clasificaciones en el objeto "classifications"');
      console.log('   Ejemplo:');
      console.log('   const classifications = {');
      console.log('     "yu0yz4rs6vr1h3l1jjnbgfm5idemx5j77vk1": "DOG",');
      console.log('     "celeste": "CAT",');
      console.log('   };');
      return;
    }

    // Aplicar clasificaciones
    let dogsCreated = 0;
    let catsCreated = 0;
    let keptAsOther = 0;
    let notFound = 0;
    let errors = 0;

    for (const medal of medals) {
      if (!medal.petName) continue;

      const classification = classifications[medal.medalString];
      
      if (classification === undefined || classification === null) {
        // No está en la lista o es null, mantener como está
        continue;
      }

      if (classification === 'OTHER') {
        keptAsOther++;
        continue;
      }

      try {
        // NOTA: Con el nuevo esquema simplificado, no hay migración necesaria
        // Los datos ya están embebidos en Medal
        console.log(`⚠️  Clasificación solicitada para ${medal.petName}: ${classification}`);
        console.log(`   (Script obsoleto - datos ya están en Medal)`);
        keptAsOther++;
      } catch (error) {
        console.error(`❌ Error procesando ${medal.petName}:`, error);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Resumen:');
    console.log(`   ✅ Perros clasificados: ${dogsCreated}`);
    console.log(`   ✅ Gatos clasificados: ${catsCreated}`);
    console.log(`   ℹ️ Mantenidos como "Otro": ${keptAsOther}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

classifyPetsBatch()
  .then(() => {
    console.log('🎉 Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

