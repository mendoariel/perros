import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyCallejeroMigration() {
  console.log('🔄 Aplicando migración de Callejero...\n');

  try {
    // 1. Crear tabla callejeros
    console.log('📦 Creando tabla callejeros...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "callejeros" (
          "id" SERIAL NOT NULL,
          "dog_id" INTEGER UNIQUE,
          "cat_id" INTEGER UNIQUE,
          "pet_id" INTEGER UNIQUE,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "callejeros_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('   ✅ Tabla callejeros creada');

    // 2. Agregar columna callejero_id a dogs (solo si la tabla existe)
    const dogsExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dogs'
      );
    `;
    
    if (dogsExists[0]?.exists) {
      console.log('📦 Agregando columna callejero_id a dogs...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "dogs" ADD COLUMN IF NOT EXISTS "callejero_id" INTEGER;
      `);
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "dogs_callejero_id_key" ON "dogs"("callejero_id") WHERE "callejero_id" IS NOT NULL;
      `);
      console.log('   ✅ Columna callejero_id agregada a dogs');
    } else {
      console.log('   ⚠️  Tabla "dogs" no existe, omitiendo...');
    }

    // 3. Agregar columna callejero_id a cats (solo si la tabla existe)
    const catsExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cats'
      );
    `;
    
    if (catsExists[0]?.exists) {
      console.log('📦 Agregando columna callejero_id a cats...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "cats" ADD COLUMN IF NOT EXISTS "callejero_id" INTEGER;
      `);
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "cats_callejero_id_key" ON "cats"("callejero_id") WHERE "callejero_id" IS NOT NULL;
      `);
      console.log('   ✅ Columna callejero_id agregada a cats');
    } else {
      console.log('   ⚠️  Tabla "cats" no existe, omitiendo...');
    }

    // 4. Agregar columna callejero_id a pets (solo si la tabla existe)
    const petsExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pets'
      );
    `;
    
    if (petsExists[0]?.exists) {
      console.log('📦 Agregando columna callejero_id a pets...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "callejero_id" INTEGER;
      `);
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "pets_callejero_id_key" ON "pets"("callejero_id") WHERE "callejero_id" IS NOT NULL;
      `);
      console.log('   ✅ Columna callejero_id agregada a pets');
    } else {
      console.log('   ⚠️  Tabla "pets" no existe, omitiendo...');
    }

    // 5. Crear foreign keys
    console.log('📦 Creando foreign keys...');
    
    // Reutilizar las variables dogsExists, catsExists, petsExists ya declaradas arriba

    // Foreign key de callejeros a dogs (solo si dogs existe)
    if (dogsExists[0]?.exists) {
      try {
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM pg_constraint 
                  WHERE conname = 'callejeros_dog_id_fkey'
              ) THEN
                  ALTER TABLE "callejeros" 
                  ADD CONSTRAINT "callejeros_dog_id_fkey" 
                  FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") 
                  ON DELETE CASCADE;
              END IF;
          END $$;
        `);
        console.log('   ✅ Foreign key callejeros -> dogs');
      } catch (e: any) {
        if (!e.message?.includes('already exists')) throw e;
      }
    } else {
      console.log('   ⚠️  Tabla "dogs" no existe, omitiendo foreign key callejeros -> dogs');
    }

    // Foreign key de callejeros a cats (solo si cats existe)
    if (catsExists[0]?.exists) {
      try {
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM pg_constraint 
                  WHERE conname = 'callejeros_cat_id_fkey'
              ) THEN
                  ALTER TABLE "callejeros" 
                  ADD CONSTRAINT "callejeros_cat_id_fkey" 
                  FOREIGN KEY ("cat_id") REFERENCES "cats"("id") 
                  ON DELETE CASCADE;
              END IF;
          END $$;
        `);
        console.log('   ✅ Foreign key callejeros -> cats');
      } catch (e: any) {
        if (!e.message?.includes('already exists')) throw e;
      }
    } else {
      console.log('   ⚠️  Tabla "cats" no existe, omitiendo foreign key callejeros -> cats');
    }

    // Foreign key de callejeros a pets (solo si pets existe)
    if (petsExists[0]?.exists) {
      try {
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM pg_constraint 
                  WHERE conname = 'callejeros_pet_id_fkey'
              ) THEN
                  ALTER TABLE "callejeros" 
                  ADD CONSTRAINT "callejeros_pet_id_fkey" 
                  FOREIGN KEY ("pet_id") REFERENCES "pets"("id") 
                  ON DELETE CASCADE;
              END IF;
          END $$;
        `);
        console.log('   ✅ Foreign key callejeros -> pets');
      } catch (e: any) {
        if (!e.message?.includes('already exists')) throw e;
      }
    } else {
      console.log('   ⚠️  Tabla "pets" no existe, omitiendo foreign key callejeros -> pets');
    }

    // Foreign key de dogs a callejeros (solo si dogs existe)
    if (dogsExists[0]?.exists) {
      try {
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM pg_constraint 
                  WHERE conname = 'dogs_callejero_id_fkey'
              ) THEN
                  ALTER TABLE "dogs" 
                  ADD CONSTRAINT "dogs_callejero_id_fkey" 
                  FOREIGN KEY ("callejero_id") REFERENCES "callejeros"("id") 
                  ON DELETE CASCADE;
              END IF;
          END $$;
        `);
        console.log('   ✅ Foreign key dogs -> callejeros');
      } catch (e: any) {
        if (!e.message?.includes('already exists')) throw e;
      }
    }

    // Foreign key de cats a callejeros (solo si cats existe)
    if (catsExists[0]?.exists) {
      try {
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM pg_constraint 
                  WHERE conname = 'cats_callejero_id_fkey'
              ) THEN
                  ALTER TABLE "cats" 
                  ADD CONSTRAINT "cats_callejero_id_fkey" 
                  FOREIGN KEY ("callejero_id") REFERENCES "callejeros"("id") 
                  ON DELETE CASCADE;
              END IF;
          END $$;
        `);
        console.log('   ✅ Foreign key cats -> callejeros');
      } catch (e: any) {
        if (!e.message?.includes('already exists')) throw e;
      }
    }

    // Foreign key de pets a callejeros (solo si pets existe)
    if (petsExists[0]?.exists) {
      try {
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM pg_constraint 
                  WHERE conname = 'pets_callejero_id_fkey'
              ) THEN
                  ALTER TABLE "pets" 
                  ADD CONSTRAINT "pets_callejero_id_fkey" 
                  FOREIGN KEY ("callejero_id") REFERENCES "callejeros"("id") 
                  ON DELETE CASCADE;
              END IF;
          END $$;
        `);
        console.log('   ✅ Foreign key pets -> callejeros');
      } catch (e: any) {
        if (!e.message?.includes('already exists')) throw e;
      }
    }

    console.log('\n✅ Migración de Callejero aplicada exitosamente!');
    console.log('\n📊 Resumen de cambios:');
    console.log('   - Tabla "callejeros" creada');
    console.log('   - Columna "callejero_id" agregada a "dogs"');
    console.log('   - Columna "callejero_id" agregada a "cats"');
    console.log('   - Columna "callejero_id" agregada a "pets"');
    console.log('   - Foreign keys creadas');
    
    console.log('\n✅ Ahora regenera Prisma Client:');
    console.log('   npx prisma generate');

  } catch (error: any) {
    console.error('\n❌ Error aplicando migración:', error.message);
    
    if (error.code === '42P07' || error.message?.includes('already exists')) {
      console.log('\n⚠️  Algunas tablas/columnas ya existen. Esto es normal.');
      console.log('   La migración se aplicó parcialmente o ya estaba aplicada.');
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyCallejeroMigration()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  });
