import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

/**
 * Script interactivo para clasificar mascotas
 * Te muestra cada mascota y te permite clasificarla manualmente
 */

interface ClassificationResult {
  type: 'DOG' | 'CAT' | 'OTHER';
  medalId: number;
  petId: number;
  petName: string;
  petImage: string | null;
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
 * Función principal interactiva
 */
async function classifyPetsInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  try {
    console.log('🔍 Clasificación Interactiva de Mascotas');
    console.log('='.repeat(60));
    console.log('');

    const medals = await prisma.medal.findMany({
      where: {
        petName: { not: '' }
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`📊 Encontradas ${medals.length} medallas con datos de mascota para clasificar\n`);
    console.log('⚠️  NOTA: Este script está obsoleto con el nuevo esquema simplificado.');
    console.log('   Los datos de mascotas están embebidos directamente en Medal.\n');

    let dogsCreated = 0;
    let catsCreated = 0;
    let skipped = 0;

    for (let i = 0; i < medals.length; i++) {
      const medal = medals[i];
      if (!medal.petName) continue;

      const imageUrl = medal.image 
        ? `http://localhost:3335/pets/files/${medal.image}` 
        : 'Sin imagen';

      console.log(`\n[${i + 1}/${medals.length}] ${medal.petName}`);
      console.log(`   Descripción: ${medal.description || 'Sin descripción'}`);
      console.log(`   Imagen: ${imageUrl}`);
      console.log('');

      const answer = await question('¿Qué tipo es? (d=Perro, c=Gato, o=Otro, s=Saltar, q=Salir): ');

      if (answer.toLowerCase() === 'q') {
        console.log('\n👋 Saliendo...');
        break;
      }

      if (answer.toLowerCase() === 's') {
        skipped++;
        console.log('⏭️ Saltado');
        continue;
      }

      // NOTA: Con el nuevo esquema simplificado, no hay migración necesaria
      console.log('⚠️  Script obsoleto - datos ya están en Medal');
      skipped++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Resumen:');
    console.log(`   ✅ Perros clasificados: ${dogsCreated}`);
    console.log(`   ✅ Gatos clasificados: ${catsCreated}`);
    console.log(`   ⏭️ Saltados/Mantenidos: ${skipped}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

classifyPetsInteractive()
  .then(() => {
    console.log('🎉 Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

