import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script de migración de datos: Migra datos de la tabla `pets` antigua
 * a las nuevas tablas `dogs`, `cats` y `pets` según el tipo de animal.
 * 
 * IMPORTANTE: Este script debe ejecutarse ANTES de aplicar la migración
 * que cambia el schema, o después si se hace una migración manual.
 */
async function migratePetsData() {
  try {
    console.log('🚀 Iniciando migración de datos de pets a dogs/cats/pets...');
    console.log('='.repeat(60));

    // 1. Verificar si existe la columna pet_type en la tabla pets
    // (Esto depende de la estructura actual de la BD)
    
    // Primero, obtener todos los pets existentes con sus medallas
    const medalsWithPets = await prisma.$queryRaw<any[]>`
      SELECT 
        m.id as medal_id,
        m."medal_string",
        m."pet_id",
        p.id as pet_id,
        p.name,
        p.image,
        p.description,
        p."phone_number",
        p."pet_type",
        p."created_at",
        p."updated_at"
      FROM medals m
      LEFT JOIN pets p ON m."pet_id" = p.id
      WHERE m."pet_id" IS NOT NULL
    `;

    console.log(`📊 Encontradas ${medalsWithPets.length} medallas con pets asociados`);

    if (medalsWithPets.length === 0) {
      console.log('✅ No hay datos para migrar');
      return;
    }

    // Contadores
    let dogsCreated = 0;
    let catsCreated = 0;
    let petsKept = 0;
    let errors = 0;

    // 2. Procesar cada pet según su tipo
    for (const medalPet of medalsWithPets) {
      try {
        const petType = medalPet.pet_type?.toUpperCase() || 'OTHER';
        const medalId = medalPet.medal_id;
        const oldPetId = medalPet.pet_id;

        if (petType === 'DOG') {
          // Crear registro en dogs
          const newDog = await prisma.$executeRaw`
            INSERT INTO dogs (name, image, description, "phone_number", "created_at", "updated_at")
            VALUES (${medalPet.name}, ${medalPet.image}, ${medalPet.description}, 
                    ${medalPet.phone_number}, ${medalPet.created_at}, ${medalPet.updated_at})
            RETURNING id
          `;

          const dogResult = await prisma.$queryRaw<{id: number}[]>`
            SELECT id FROM dogs WHERE name = ${medalPet.name} 
            AND "created_at" = ${medalPet.created_at}
            ORDER BY id DESC LIMIT 1
          `;

          if (dogResult && dogResult.length > 0) {
            const newDogId = dogResult[0].id;
            
            // Actualizar medal para usar dog_id en lugar de pet_id
            await prisma.$executeRaw`
              UPDATE medals 
              SET "dog_id" = ${newDogId}, "pet_id" = NULL
              WHERE id = ${medalId}
            `;

            dogsCreated++;
            console.log(`✅ Migrado perro: ${medalPet.name} (medal: ${medalPet.medal_string})`);
          }

        } else if (petType === 'CAT') {
          // Crear registro en cats
          const catResult = await prisma.$queryRaw<{id: number}[]>`
            INSERT INTO cats (name, image, description, "phone_number", "created_at", "updated_at)
            VALUES (${medalPet.name}, ${medalPet.image}, ${medalPet.description}, 
                    ${medalPet.phone_number}, ${medalPet.created_at}, ${medalPet.updated_at})
            RETURNING id
          `;

          // Obtener el ID del gato creado
          const newCat = await prisma.$queryRaw<{id: number}[]>`
            SELECT id FROM cats WHERE name = ${medalPet.name} 
            AND "created_at" = ${medalPet.created_at}
            ORDER BY id DESC LIMIT 1
          `;

          if (newCat && newCat.length > 0) {
            const newCatId = newCat[0].id;
            
            // Actualizar medal para usar cat_id en lugar de pet_id
            await prisma.$executeRaw`
              UPDATE medals 
              SET "cat_id" = ${newCatId}, "pet_id" = NULL
              WHERE id = ${medalId}
            `;

            catsCreated++;
            console.log(`✅ Migrado gato: ${medalPet.name} (medal: ${medalPet.medal_string})`);
          }

        } else {
          // OTHER - mantener en pets pero cambiar pet_type a animal_type
          await prisma.$executeRaw`
            UPDATE pets 
            SET "animal_type" = COALESCE("pet_type", 'Otro')
            WHERE id = ${oldPetId}
          `;

          petsKept++;
          console.log(`✅ Mantenido como "otro": ${medalPet.name} (medal: ${medalPet.medal_string})`);
        }

      } catch (error) {
        errors++;
        console.error(`❌ Error migrando pet de medalla ${medalPet.medal_string}:`, error);
      }
    }

    console.log('='.repeat(60));
    console.log('📊 Resumen de migración:');
    console.log(`   - Perros migrados: ${dogsCreated}`);
    console.log(`   - Gatos migrados: ${catsCreated}`);
    console.log(`   - Otros mantenidos: ${petsKept}`);
    console.log(`   - Errores: ${errors}`);
    console.log('='.repeat(60));

    if (errors === 0) {
      console.log('✅ Migración completada exitosamente');
    } else {
      console.log(`⚠️ Migración completada con ${errors} error(es)`);
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migratePetsData()
  .then(() => {
    console.log('🎉 Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

