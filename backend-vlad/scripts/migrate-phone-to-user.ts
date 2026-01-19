import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para migrar phoneNumber de medals a users
 * 
 * Este script:
 * 1. Obtiene todas las medallas con phoneNumber
 * 2. Para cada medalla, actualiza el phoneNumber del usuario (owner)
 * 3. Si un usuario tiene múltiples medallas con diferentes teléfonos, usa el más reciente
 * 
 * NOTA: Usa SQL directo para no depender de Prisma Client actualizado
 */
async function migratePhoneToUser() {
  try {
    console.log('🚀 Iniciando migración de phoneNumber de medals a users...\n');

    // Verificar si la columna phone_number existe en users
    const checkColumn = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
          AND column_name = 'phone_number'
      ) as exists
    `;

    const columnExists = checkColumn[0]?.exists || false;

    if (!columnExists) {
      console.log('⚠️  La columna phone_number no existe en users aún.');
      console.log('📝 Creando la columna primero...\n');
      
      // Crear la columna si no existe
      await prisma.$executeRawUnsafe(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS phone_number TEXT;
      `);
      
      console.log('✅ Columna phone_number creada\n');
    }

    // Obtener todas las medallas con phoneNumber y su owner usando SQL directo
    const medals = await prisma.$queryRawUnsafe<Array<{
      id: number;
      owner_id: number;
      phone_number: string | null;
      updated_at: Date;
    }>>(`
      SELECT 
        id,
        owner_id,
        phone_number,
        updated_at
      FROM medals
      WHERE phone_number IS NOT NULL 
        AND phone_number != ''
        AND owner_id IS NOT NULL
      ORDER BY updated_at DESC
    `);

    console.log(`📊 Encontradas ${medals.length} medallas con phoneNumber\n`);

    if (medals.length === 0) {
      console.log('✅ No hay medallas con phoneNumber para migrar');
      await prisma.$disconnect();
      return;
    }

    // Agrupar por owner_id y tomar el teléfono más reciente
    const userPhones = new Map<number, string>();
    
    for (const medal of medals) {
      const userId = medal.owner_id;
      const phoneNumber = medal.phone_number;
      
      if (phoneNumber && !userPhones.has(userId)) {
        // Solo tomar el primer teléfono encontrado (el más reciente por el ORDER BY)
        userPhones.set(userId, phoneNumber);
      }
    }

    console.log(`👥 Encontrados ${userPhones.size} usuarios únicos con teléfonos\n`);

    // Actualizar usuarios usando SQL directo
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const [userId, phoneNumber] of userPhones.entries()) {
      try {
        // Verificar si el usuario existe y ya tiene un phoneNumber usando SQL
        const userCheck = await prisma.$queryRawUnsafe<Array<{
          id: number;
          phone_number: string | null;
          phonenumber: string | null;
        }>>(`
          SELECT 
            id,
            phone_number,
            phonenumber
          FROM users
          WHERE id = $1
        `, userId);

        if (userCheck.length === 0) {
          console.log(`⚠️  Usuario con id ${userId} no encontrado, saltando...`);
          skipped++;
          continue;
        }

        const user = userCheck[0];

        // Si el usuario ya tiene phoneNumber, no sobrescribir (a menos que esté vacío)
        const existingPhone = user.phone_number || user.phonenumber;
        if (existingPhone && existingPhone.trim() !== '') {
          console.log(`⏭️  Usuario ${userId} ya tiene phoneNumber: ${existingPhone}, saltando...`);
          skipped++;
          continue;
        }

        // Actualizar phoneNumber y phonenumber (compatibilidad) usando SQL directo
        await prisma.$executeRawUnsafe(`
          UPDATE users 
          SET 
            phone_number = $1,
            phonenumber = $1
          WHERE id = $2
        `, phoneNumber, userId);

        console.log(`✅ Usuario ${userId} actualizado con phoneNumber: ${phoneNumber}`);
        updated++;
      } catch (error: any) {
        console.error(`❌ Error actualizando usuario ${userId}:`, error.message);
        errors++;
      }
    }

    console.log('\n📈 Resumen de migración:');
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ⏭️  Saltados: ${skipped}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📊 Total procesados: ${userPhones.size}\n`);

    console.log('✅ Migración de phoneNumber completada\n');

  } catch (error: any) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migratePhoneToUser()
  .then(() => {
    console.log('🎉 Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
