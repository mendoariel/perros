import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script rápido para verificar que el sistema de perfil de usuario está funcionando
 */
async function verifyUserProfile() {
  try {
    console.log('🔍 Verificando sistema de perfil de usuario...\n');

    // 1. Verificar que los campos existen en users
    console.log('1️⃣ Verificando campos en tabla users...');
    const userColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
        AND column_name IN ('phone_number', 'first_name', 'last_name', 'avatar', 'bio', 'address', 'city', 'country')
      ORDER BY column_name;
    `;

    const requiredColumns = ['phone_number', 'first_name', 'last_name', 'avatar', 'bio', 'address', 'city', 'country'];
    const foundColumns = userColumns.map(c => c.column_name);

    console.log(`   ✅ Columnas encontradas: ${foundColumns.length}/${requiredColumns.length}`);
    requiredColumns.forEach(col => {
      const exists = foundColumns.includes(col);
      console.log(`   ${exists ? '✅' : '❌'} ${col}`);
    });

    if (foundColumns.length !== requiredColumns.length) {
      console.log('\n   ⚠️  Faltan algunas columnas. Ejecuta la migración.');
    }

    // 2. Verificar usuarios con phoneNumber
    console.log('\n2️⃣ Verificando usuarios con phoneNumber...');
    const usersWithPhone = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM users
      WHERE phone_number IS NOT NULL AND phone_number != '';
    `;

    const count = Number(usersWithPhone[0]?.count || 0);
    console.log(`   ✅ Usuarios con teléfono: ${count}`);

    if (count > 0) {
      const sampleUser = await prisma.user.findFirst({
        where: {
          phoneNumber: { not: null }
        },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          firstName: true,
          lastName: true
        }
      });

      if (sampleUser) {
        console.log(`   📋 Ejemplo:`);
        console.log(`      ID: ${sampleUser.id}`);
        console.log(`      Email: ${sampleUser.email}`);
        console.log(`      Teléfono: ${sampleUser.phoneNumber}`);
        console.log(`      Nombre: ${sampleUser.firstName || '(sin nombre)'}`);
        console.log(`      Apellido: ${sampleUser.lastName || '(sin apellido)'}`);
      }
    }

    // 3. Verificar que medals NO tiene phone_number
    console.log('\n3️⃣ Verificando que medals NO tiene phone_number...');
    const medalPhoneColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'medals' 
        AND column_name LIKE '%phone%';
    `;

    if (medalPhoneColumns.length === 0) {
      console.log('   ✅ Correcto: medals NO tiene columnas de teléfono');
    } else {
      console.log(`   ⚠️  Advertencia: medals aún tiene columnas de teléfono: ${medalPhoneColumns.map(c => c.column_name).join(', ')}`);
    }

    // 4. Verificar medallas y sus owners
    console.log('\n4️⃣ Verificando relación medals -> users...');
    const medalsWithOwners = await prisma.medal.findMany({
      take: 3,
      select: {
        id: true,
        medalString: true,
        petName: true,
        owner: {
          select: {
            id: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    console.log(`   ✅ Medallas verificadas: ${medalsWithOwners.length}`);
    medalsWithOwners.forEach((medal, index) => {
      console.log(`   ${index + 1}. ${medal.medalString}`);
      console.log(`      Mascota: ${medal.petName || '(sin nombre)'}`);
      console.log(`      Owner: ${medal.owner.email}`);
      console.log(`      Teléfono owner: ${medal.owner.phoneNumber || '(sin teléfono)'}`);
    });

    // 5. Resumen
    console.log('\n📊 RESUMEN:');
    console.log(`   ✅ Columnas en users: ${foundColumns.length}/${requiredColumns.length}`);
    console.log(`   ✅ Usuarios con teléfono: ${count}`);
    console.log(`   ✅ Medals sin phone_number: ${medalPhoneColumns.length === 0 ? 'Sí' : 'No'}`);
    console.log(`   ✅ Relaciones funcionando: ${medalsWithOwners.length > 0 ? 'Sí' : 'No'}`);

    const allGood = 
      foundColumns.length === requiredColumns.length &&
      medalPhoneColumns.length === 0 &&
      medalsWithOwners.length > 0;

    if (allGood) {
      console.log('\n🎉 ¡Todo está funcionando correctamente!');
    } else {
      console.log('\n⚠️  Hay algunos problemas. Revisa los detalles arriba.');
    }

  } catch (error: any) {
    console.error('❌ Error durante la verificación:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
verifyUserProfile()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
