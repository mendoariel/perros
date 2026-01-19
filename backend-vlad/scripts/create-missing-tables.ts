import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMissingTables() {
    try {
        console.log('🔍 Verificando tablas existentes...');
        
        // Verificar si las tablas ya existen
        const existingTables = await prisma.$queryRaw<Array<{ table_name: string }>>`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('scanned_medals', 'registration_attempts')
        `;
        
        const tableNames = existingTables.map(t => t.table_name);
        const hasScannedMedals = tableNames.includes('scanned_medals');
        const hasRegistrationAttempts = tableNames.includes('registration_attempts');
        
        console.log(`   - scanned_medals: ${hasScannedMedals ? '✅ Existe' : '❌ No existe'}`);
        console.log(`   - registration_attempts: ${hasRegistrationAttempts ? '✅ Existe' : '❌ No existe'}`);
        
        if (hasScannedMedals && hasRegistrationAttempts) {
            console.log('\n✅ Todas las tablas ya existen. No es necesario crear nada.');
            return;
        }
        
        console.log('\n📦 Creando tablas faltantes...');
        console.log('⚠️  Esta operación NO eliminará datos existentes.\n');
        
        // Ejecutar SQL directamente sin dividir (más seguro para bloques DO)
        console.log('\n📝 Ejecutando SQL seguro...\n');
        
        // Ejecutar SQL paso a paso de forma segura
        console.log('\n📝 Ejecutando SQL paso a paso...\n');
        
        let created = 0;
        let skipped = 0;
        
        // 1. Crear enum AttemptStatus
        try {
            await prisma.$executeRawUnsafe(`
                SELECT 'AttemptStatus'::regtype;
            `);
            console.log('   ✅ Enum AttemptStatus ya existe');
            skipped++;
        } catch {
            try {
                await prisma.$executeRawUnsafe(`
                    CREATE TYPE "AttemptStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED');
                `);
                console.log('   ✅ Enum AttemptStatus creado');
                created++;
            } catch (error: any) {
                if (error.code === '42710' || error.message?.includes('already exists')) {
                    console.log('   ⚠️  Enum AttemptStatus ya existe (omitido)');
                    skipped++;
                } else {
                    console.error(`   ❌ Error creando enum: ${error.message}`);
                }
            }
        }
        
        // 2. Crear tabla scanned_medals
        try {
            await prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "scanned_medals" (
                    "id" SERIAL NOT NULL,
                    "medal_string" TEXT NOT NULL UNIQUE,
                    "register_hash" TEXT NOT NULL,
                    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "status" "MedalState" NOT NULL,
                    "user_id" INTEGER,
                    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "scanned_medals_pkey" PRIMARY KEY ("id")
                );
            `);
            console.log('   ✅ Tabla scanned_medals creada');
            created++;
        } catch (error: any) {
            if (error.code === '42P07' || error.message?.includes('already exists')) {
                console.log('   ⚠️  Tabla scanned_medals ya existe (omitido)');
                skipped++;
            } else {
                console.error(`   ❌ Error creando scanned_medals: ${error.message}`);
            }
        }
        
        // 3. Crear índices en scanned_medals
        const scannedMedalIndexes = [
            'CREATE INDEX IF NOT EXISTS "scanned_medals_medal_string_idx" ON "scanned_medals"("medal_string");',
            'CREATE INDEX IF NOT EXISTS "scanned_medals_status_idx" ON "scanned_medals"("status");',
            'CREATE INDEX IF NOT EXISTS "scanned_medals_user_id_idx" ON "scanned_medals"("user_id");',
        ];
        
        for (const indexSql of scannedMedalIndexes) {
            try {
                await prisma.$executeRawUnsafe(indexSql);
                created++;
            } catch (error: any) {
                skipped++;
            }
        }
        console.log('   ✅ Índices en scanned_medals creados');
        
        // 4. Crear foreign key a users
        try {
            await prisma.$executeRawUnsafe(`
                ALTER TABLE "scanned_medals" 
                ADD CONSTRAINT "scanned_medals_user_id_fkey" 
                FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
            `);
            console.log('   ✅ Foreign key a users creada');
            created++;
        } catch (error: any) {
            if (error.code === '42710' || error.message?.includes('already exists') || error.message?.includes('duplicate')) {
                console.log('   ⚠️  Foreign key a users ya existe (omitido)');
                skipped++;
            } else {
                console.error(`   ❌ Error creando foreign key: ${error.message}`);
            }
        }
        
        // 5. Crear tabla registration_attempts
        try {
            await prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "registration_attempts" (
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
                );
            `);
            console.log('   ✅ Tabla registration_attempts creada');
            created++;
        } catch (error: any) {
            if (error.code === '42P07' || error.message?.includes('already exists')) {
                console.log('   ⚠️  Tabla registration_attempts ya existe (omitido)');
                skipped++;
            } else {
                console.error(`   ❌ Error creando registration_attempts: ${error.message}`);
            }
        }
        
        // 6. Crear índices en registration_attempts
        const registrationIndexes = [
            'CREATE INDEX IF NOT EXISTS "registration_attempts_email_idx" ON "registration_attempts"("email");',
            'CREATE INDEX IF NOT EXISTS "registration_attempts_medal_string_idx" ON "registration_attempts"("medal_string");',
            'CREATE INDEX IF NOT EXISTS "registration_attempts_status_idx" ON "registration_attempts"("status");',
            'CREATE INDEX IF NOT EXISTS "registration_attempts_hash_to_register_idx" ON "registration_attempts"("hash_to_register");',
        ];
        
        for (const indexSql of registrationIndexes) {
            try {
                await prisma.$executeRawUnsafe(indexSql);
                created++;
            } catch (error: any) {
                skipped++;
            }
        }
        console.log('   ✅ Índices en registration_attempts creados');
        
        // 7. Crear foreign key a scanned_medals
        try {
            await prisma.$executeRawUnsafe(`
                ALTER TABLE "registration_attempts" 
                ADD CONSTRAINT "registration_attempts_scanned_medal_id_fkey" 
                FOREIGN KEY ("scanned_medal_id") REFERENCES "scanned_medals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            `);
            console.log('   ✅ Foreign key a scanned_medals creada');
            created++;
        } catch (error: any) {
            if (error.code === '42710' || error.message?.includes('already exists') || error.message?.includes('duplicate')) {
                console.log('   ⚠️  Foreign key a scanned_medals ya existe (omitido)');
                skipped++;
            } else {
                console.error(`   ❌ Error creando foreign key: ${error.message}`);
            }
        }
        
        console.log(`\n✅ Proceso completado:`);
        console.log(`   - Creaciones exitosas: ${created}`);
        console.log(`   - Ya existían (ignoradas): ${skipped}`);
        
        // Verificar que las tablas fueron creadas
        console.log('\n🔍 Verificando que las tablas existen...');
        const finalCheck = await prisma.$queryRaw<Array<{ table_name: string }>>`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('scanned_medals', 'registration_attempts')
        `;
        
        const finalTableNames = finalCheck.map(t => t.table_name);
        const finalHasScannedMedals = finalTableNames.includes('scanned_medals');
        const finalHasRegistrationAttempts = finalTableNames.includes('registration_attempts');
        
        console.log(`   - scanned_medals: ${finalHasScannedMedals ? '✅' : '❌'}`);
        console.log(`   - registration_attempts: ${finalHasRegistrationAttempts ? '✅' : '❌'}`);
        
        if (finalHasScannedMedals && finalHasRegistrationAttempts) {
            console.log('\n✅ ¡Todas las tablas están creadas correctamente!');
            console.log('\n📋 Próximos pasos:');
            console.log('   1. Regenera Prisma Client: npx prisma generate');
            console.log('   2. Reinicia el servidor backend');
            console.log('   3. Prueba el endpoint /api/qr/validate-email');
        } else {
            console.log('\n⚠️  Algunas tablas no se crearon. Revisa los errores arriba.');
        }
        
    } catch (error) {
        console.error('\n❌ Error al crear las tablas:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar con timeout de 30 segundos
const TIMEOUT = 30000;
Promise.race([
    createMissingTables(),
    new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El script tardó más de 30 segundos')), TIMEOUT);
    })
])
    .then(() => {
        console.log('\n✅ Script completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script falló:', error.message);
        process.exit(1);
    });

