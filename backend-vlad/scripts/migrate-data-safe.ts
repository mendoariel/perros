import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script de migración SEGURA de datos:
 * Migra datos de pets a dogs/cats según pet_type
 * 
 * IMPORTANTE: Ejecutar este script DESPUÉS de crear las tablas dogs y cats
 * pero ANTES de eliminar la columna pet_type de pets
 */
async function migrateDataSafe() {
  try {
    console.log('🚀 Iniciando migración SEGURA de datos...');
    console.log('='.repeat(60));

    // Paso 1: Verificar que las tablas dogs y cats existen
    const dogsTable = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'dogs'
    `;

    const catsTable = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'cats'
    `;

    if (dogsTable.length === 0 || catsTable.length === 0) {
      throw new Error('Las tablas dogs y/o cats no existen. Aplica la migración del schema primero.');
    }

    console.log('✅ Tablas dogs y cats verificadas');

    // Paso 2: Obtener todos los pets con sus medallas
    const petsWithMedals = await prisma.$queryRaw<any[]>`
      SELECT 
        p.id as pet_id,
        p.name,
        p.image,
        p.description,
        p."phone_number" as phone_number,
        p."pet_type",
        p."created_at",
        p."updated_at",
        m.id as medal_id,
        m."medal_string"
      FROM pets p
      INNER JOIN medals m ON m."pet_id" = p.id
      WHERE p."pet_type" IS NOT NULL
    `;

    console.log(`📊 Encontrados ${petsWithMedals.length} pets para migrar`);

    if (petsWithMedals.length === 0) {
      console.log('✅ No hay datos para migrar');
      return;
    }

    let dogsCreated = 0;
    let catsCreated = 0;
    let petsKept = 0;
    let errors = 0;

    // Paso 3: Migrar cada pet según su tipo
    for (const item of petsWithMedals) {
      try {
        const petType = (item.pet_type as string)?.toUpperCase() || 'OTHER';

        if (petType === 'DOG') {
          // Crear en dogs
          const newDog = await prisma.$executeRaw`
            INSERT INTO dogs (name, image, description, "phone_number", "created_at", "updated_at")
            VALUES (${item.name}, ${item.image}, ${item.description}, 
                    ${item.phone_number}, ${item.created_at}, ${item.updated_at})
            RETURNING id
          `;

          // Obtener el ID del perro recién creado
          const dogIdResult = await prisma.$queryRaw<{id: number}[]>`
            SELECT id FROM dogs 
            WHERE name = ${item.name} 
              AND "created_at" = ${item.created_at}
            ORDER BY id DESC 
            LIMIT 1
          `;

          if (dogIdResult && dogIdResult.length > 0) {
            const dogId = dogIdResult[0].id;

            // Actualizar medal
            await prisma.$executeRaw`
              UPDATE medals 
              SET "dog_id" = ${dogId}, "pet_id" = NULL
              WHERE id = ${item.medal_id}
            `;

            dogsCreated++;
            console.log(`✅ Perro migrado: ${item.name} → dogs.id=${dogId}`);
          }

        } else if (petType === 'CAT') {
          // Crear en cats
          const newCat = await prisma.$executeRaw`
            INSERT INTO cats (name, image, description, "phone_number", "created_at", "updated_at")
            VALUES (${item.name}, ${item.image}, ${item.description}, 
                    ${item.phone_number}, ${item.created_at}, ${item.updated_at})
            RETURNING id
          `;

          // Obtener el ID del gato recién creado
          const catIdResult = await prisma.$queryRaw<{id: number}[]>`
            SELECT id FROM cats 
            WHERE name = ${item.name} 
              AND "created_at" = ${item.created_at}
            ORDER BY id DESC 
            LIMIT 1
          `;

          if (catIdResult && catIdResult.length > 0) {
            const catId = catIdResult[0].id;

            // Actualizar medal
            await prisma.$executeRaw`
              UPDATE medals 
              SET "cat_id" = ${catId}, "pet_id" = NULL
              WHERE id = ${item.medal_id}
            `;

            catsCreated++;
            console.log(`✅ Gato migrado: ${item.name} → cats.id=${catId}`);
          }

        } else {
          // OTHER - mantener en pets, solo cambiar pet_type a animal_type
          await prisma.$executeRaw`
            UPDATE pets 
            SET "animal_type" = COALESCE("pet_type", 'Otro')
            WHERE id = ${item.pet_id}
          `;

          petsKept++;
          console.log(`✅ Mantenido como "otro": ${item.name}`);
        }

      } catch (error) {
        errors++;
        console.error(`❌ Error migrando pet ${item.name} (ID: ${item.pet_id}):`, error);
      }
    }

    console.log('='.repeat(60));
    console.log('📊 Resumen:');
    console.log(`   ✅ Perros migrados: ${dogsCreated}`);
    console.log(`   ✅ Gatos migrados: ${catsCreated}`);
    console.log(`   ✅ Otros mantenidos: ${petsKept}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log('='.repeat(60));

    if (errors === 0) {
      console.log('✅ Migración de datos completada exitosamente');
      console.log('\n⚠️ IMPORTANTE: Ahora puedes eliminar la columna pet_type de la tabla pets');
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

migrateDataSafe()
  .then(() => {
    console.log('🎉 Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

