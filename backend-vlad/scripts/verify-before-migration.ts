import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyBeforeMigration() {
  console.log('🔍 Verificando datos antes de la migración...\n');

  try {
    // 1. Verificar dogs sin pet relacionado
    const dogsWithoutPet = await prisma.$queryRaw<Array<{ id: number; name: string }>>`
      SELECT d.id, d.name
      FROM dogs d
      LEFT JOIN medals m ON m.dog_id = d.id
      WHERE m.id IS NULL OR m.pet_id IS NULL
      LIMIT 10
    `;

    console.log(`📊 Dogs sin pet relacionado: ${dogsWithoutPet.length}`);
    if (dogsWithoutPet.length > 0) {
      console.log('⚠️  ADVERTENCIA: Hay dogs que podrían perder datos:');
      dogsWithoutPet.forEach(dog => {
        console.log(`   - Dog ID: ${dog.id}, Name: ${dog.name}`);
      });
    }

    // 2. Verificar cats sin pet relacionado
    const catsWithoutPet = await prisma.$queryRaw<Array<{ id: number; name: string }>>`
      SELECT c.id, c.name
      FROM cats c
      LEFT JOIN medals m ON m.cat_id = c.id
      WHERE m.id IS NULL OR m.pet_id IS NULL
      LIMIT 10
    `;

    console.log(`\n📊 Cats sin pet relacionado: ${catsWithoutPet.length}`);
    if (catsWithoutPet.length > 0) {
      console.log('⚠️  ADVERTENCIA: Hay cats que podrían perder datos:');
      catsWithoutPet.forEach(cat => {
        console.log(`   - Cat ID: ${cat.id}, Name: ${cat.name}`);
      });
    }

    // 3. Verificar dogs con pet relacionado
    const dogsWithPet = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM dogs d
      INNER JOIN medals m ON m.dog_id = d.id
      WHERE m.pet_id IS NOT NULL
    `;

    console.log(`\n✅ Dogs con pet relacionado: ${Number(dogsWithPet[0].count)}`);
    console.log('   Estos se migrarán correctamente');

    // 4. Verificar cats con pet relacionado
    const catsWithPet = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM cats c
      INNER JOIN medals m ON m.cat_id = c.id
      WHERE m.pet_id IS NOT NULL
    `;

    console.log(`\n✅ Cats con pet relacionado: ${Number(catsWithPet[0].count)}`);
    console.log('   Estos se migrarán correctamente');

    // 5. Verificar total de medallas
    const totalMedals = await prisma.medal.count();

    console.log(`\n📈 Totales:`);
    console.log(`   - Medallas: ${totalMedals}`);

    // Resumen final
    console.log(`\n${'='.repeat(50)}`);
    console.log('⚠️  NOTA: Este script verifica estructura antigua.');
    console.log('   Con el nuevo esquema simplificado, los datos están embebidos en Medal.');
    console.log(`${'='.repeat(50)}\n`);

  } catch (error) {
    console.error('❌ Error al verificar:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyBeforeMigration();
