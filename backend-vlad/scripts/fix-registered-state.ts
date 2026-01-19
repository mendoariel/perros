import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRegisteredState() {
  try {
    console.log('🔄 Corrigiendo estado REGISTERED...');
    console.log('='.repeat(60));

    // Verificar el tipo enum real en la base de datos
    const enumType = await prisma.$queryRaw<any[]>`
      SELECT t.typname
      FROM pg_type t 
      JOIN pg_attribute a ON a.attrelid = (
        SELECT oid FROM pg_class WHERE relname = 'virgin_medals'
      )
      JOIN pg_type t2 ON a.atttypid = t2.oid
      WHERE a.attname = 'status' 
      AND t2.typname IN (
        SELECT typname FROM pg_type WHERE typtype = 'e'
      )
      LIMIT 1
    `;

    if (enumType && enumType.length > 0) {
      const typeName = enumType[0].typname;
      console.log(`📊 Tipo enum encontrado: ${typeName}`);

      // Actualizar virgin_medals con REGISTERED
      await prisma.$executeRawUnsafe(`
        UPDATE virgin_medals 
        SET status = 'ENABLED'::${typeName}
        WHERE status::text = 'REGISTERED'
      `);
      console.log('   ✅ Estado REGISTERED actualizado a ENABLED en virgin_medals');
    } else {
      // Intentar sin especificar el tipo
      console.log('⚠️  No se pudo detectar el tipo enum, intentando actualización directa...');
      
      // Obtener valores del enum
      const enumValues = await prisma.$queryRaw<any[]>`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid FROM pg_type WHERE typname = (
            SELECT typname FROM pg_type WHERE oid = (
              SELECT atttypid FROM pg_attribute 
              WHERE attrelid = (SELECT oid FROM pg_class WHERE relname = 'virgin_medals')
              AND attname = 'status'
            )
          )
        )
      `;

      console.log('   Valores del enum:', enumValues.map(v => v.enumlabel).join(', '));

      // Si ENABLED existe, actualizar directamente
      if (enumValues.some(v => v.enumlabel === 'ENABLED')) {
        // Encontrar el nombre correcto del tipo
        const typeResult = await prisma.$queryRaw<any[]>`
          SELECT typname
          FROM pg_type
          WHERE oid = (
            SELECT atttypid FROM pg_attribute 
            WHERE attrelid = (SELECT oid FROM pg_class WHERE relname = 'virgin_medals')
            AND attname = 'status'
          )
        `;

        if (typeResult && typeResult.length > 0) {
          const actualTypeName = typeResult[0].typname;
          console.log(`   Usando tipo: ${actualTypeName}`);
          
          await prisma.$executeRawUnsafe(`
            UPDATE virgin_medals 
            SET status = 'ENABLED'::${actualTypeName}
            WHERE status::text = 'REGISTERED'
          `);
          
          console.log('   ✅ Estado REGISTERED actualizado');
        }
      }
    }

    // Verificar resultado
    const afterUpdate = await prisma.$queryRaw<any[]>`
      SELECT status::text as status, COUNT(*) as count
      FROM virgin_medals
      WHERE status::text = 'REGISTERED'
      GROUP BY status
    `;

    if (afterUpdate.length === 0) {
      console.log('\n✅ No quedan registros con estado REGISTERED');
    } else {
      console.log(`\n⚠️  Aún quedan ${afterUpdate[0].count} registros con REGISTERED`);
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    // Si falla, intentar método alternativo usando ALTER TABLE directamente
    console.log('\n🔄 Intentando método alternativo...');
    
    try {
      // Crear un nuevo enum temporal con todos los valores necesarios
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
          -- Agregar ENABLED si no existe
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'ENABLED' 
            AND enumtypid = (
              SELECT oid FROM pg_type WHERE typname = 'MedalState'
            )
          ) THEN
            ALTER TYPE "MedalState" ADD VALUE 'ENABLED';
          END IF;
        END $$;
      `);
      
      // Actualizar usando el nombre del enum directamente
      await prisma.$executeRawUnsafe(`
        UPDATE virgin_medals 
        SET status = 'ENABLED'::"MedalState"
        WHERE status::text = 'REGISTERED'
      `);
      
      console.log('   ✅ Actualizado usando método alternativo');
    } catch (e2: any) {
      console.error('   ❌ Método alternativo también falló:', e2.message);
      throw e2;
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixRegisteredState()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
