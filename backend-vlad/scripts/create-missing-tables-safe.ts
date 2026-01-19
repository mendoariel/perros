import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para crear tablas faltantes antes de aplicar prisma db push
 */
async function createMissingTables() {
  try {
    console.log('🔄 Creando tablas faltantes...');
    console.log('='.repeat(60));

    // Verificar qué tablas existen
    const existingTables = await prisma.$queryRaw<any[]>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    const tableNames = existingTables.map(t => t.tablename);
    console.log(`📊 Tablas existentes: ${tableNames.length}`);
    tableNames.forEach(t => console.log(`   - ${t}`));

    // Verificar si scanned_medals existe
    const hasScannedMedals = tableNames.includes('scanned_medals');
    const hasRegistrationAttempts = tableNames.includes('registration_attempts');
    const hasMedalFronts = tableNames.includes('medal_fronts');

    console.log(`\n📊 Tablas requeridas:`);
    console.log(`   - scanned_medals: ${hasScannedMedals ? '✅' : '❌'}`);
    console.log(`   - registration_attempts: ${hasRegistrationAttempts ? '✅' : '❌'}`);
    console.log(`   - medal_fronts: ${hasMedalFronts ? '✅' : '❌'}`);

    if (!hasScannedMedals) {
      console.log('\n📦 Creando tabla scanned_medals...');
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "scanned_medals" (
          "id" SERIAL NOT NULL,
          "medal_string" TEXT NOT NULL,
          "register_hash" TEXT NOT NULL,
          "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "status" "MedalState" NOT NULL DEFAULT 'VIRGIN',
          "user_id" INTEGER,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "scanned_medals_pkey" PRIMARY KEY ("id")
        )`);
      
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "scanned_medals_medal_string_key" ON "scanned_medals"("medal_string")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "scanned_medals_medal_string_idx" ON "scanned_medals"("medal_string")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "scanned_medals_status_idx" ON "scanned_medals"("status")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "scanned_medals_user_id_idx" ON "scanned_medals"("user_id")`);
      
      console.log('   ✅ Tabla scanned_medals creada');
    }

    if (!hasRegistrationAttempts) {
      console.log('\n📦 Creando tabla registration_attempts...');
      
      // Verificar si existe el enum AttemptStatus
      const hasAttemptStatus = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count 
        FROM pg_type 
        WHERE typname = 'AttemptStatus'
      `;

      if (Number(hasAttemptStatus[0]?.count || 0) === 0) {
        console.log('   Creando enum AttemptStatus...');
        await prisma.$executeRawUnsafe(`
          CREATE TYPE "AttemptStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED');
        `);
      }
      
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "registration_attempts" (
          "id" SERIAL NOT NULL,
          "email" TEXT NOT NULL,
          "password_hash" TEXT NOT NULL,
          "medal_string" TEXT NOT NULL,
          "scanned_medal_id" INTEGER NOT NULL,
          "hash_to_register" TEXT NOT NULL,
          "status" "AttemptStatus" NOT NULL DEFAULT 'PENDING',
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "confirmed_at" TIMESTAMP(3),
          CONSTRAINT "registration_attempts_pkey" PRIMARY KEY ("id")
        )`);
      
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "registration_attempts_email_idx" ON "registration_attempts"("email")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "registration_attempts_medal_string_idx" ON "registration_attempts"("medal_string")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "registration_attempts_status_idx" ON "registration_attempts"("status")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "registration_attempts_hash_to_register_idx" ON "registration_attempts"("hash_to_register")`);
      
      console.log('   ✅ Tabla registration_attempts creada');
    }

    if (!hasMedalFronts) {
      console.log('\n📦 Creando tabla medal_fronts...');
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "medal_fronts" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT NOT NULL DEFAULT '',
          "file_name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "size" DOUBLE PRECISION NOT NULL,
          "width" DOUBLE PRECISION,
          "height" DOUBLE PRECISION,
          "background_color" TEXT NOT NULL,
          "logo_color" TEXT NOT NULL,
          "logo_size" DOUBLE PRECISION NOT NULL,
          "logo_x" DOUBLE PRECISION NOT NULL,
          "logo_y" DOUBLE PRECISION NOT NULL,
          "border_radius" DOUBLE PRECISION NOT NULL,
          "use_background_image" BOOLEAN NOT NULL,
          "background_image" TEXT,
          "background_image_size" DOUBLE PRECISION NOT NULL,
          "background_image_x" DOUBLE PRECISION NOT NULL,
          "background_image_y" DOUBLE PRECISION NOT NULL,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "user_id" INTEGER NOT NULL,
          CONSTRAINT "medal_fronts_pkey" PRIMARY KEY ("id")
        )`);
      
      console.log('   ✅ Tabla medal_fronts creada');
    }

    // Agregar foreign keys después de crear las tablas
    if (!hasScannedMedals || !hasRegistrationAttempts) {
      console.log('\n📦 Agregando foreign keys...');
      
      // Foreign key de scanned_medals a users
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "scanned_medals" 
          ADD CONSTRAINT "scanned_medals_user_id_fkey" 
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        `);
        console.log('   ✅ Foreign key scanned_medals -> users');
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          console.log('   ⚠️  Error agregando foreign key scanned_medals -> users:', e.message);
        }
      }
      
      // Foreign key de registration_attempts a scanned_medals
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "registration_attempts" 
          ADD CONSTRAINT "registration_attempts_scanned_medal_id_fkey" 
          FOREIGN KEY ("scanned_medal_id") REFERENCES "scanned_medals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        console.log('   ✅ Foreign key registration_attempts -> scanned_medals');
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          console.log('   ⚠️  Error agregando foreign key registration_attempts -> scanned_medals:', e.message);
        }
      }
      
      // Foreign key de medal_fronts a users
      if (!hasMedalFronts) {
        try {
          await prisma.$executeRawUnsafe(`
            ALTER TABLE "medal_fronts" 
            ADD CONSTRAINT "medal_fronts_user_id_fkey" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          `);
          console.log('   ✅ Foreign key medal_fronts -> users');
        } catch (e: any) {
          if (!e.message?.includes('already exists')) {
            console.log('   ⚠️  Error agregando foreign key medal_fronts -> users:', e.message);
          }
        }
      }
    }

    console.log('\n✅ Tablas faltantes creadas exitosamente!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createMissingTables()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
