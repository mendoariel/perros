import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDbStatus() {
  try {
    console.log('📊 ESTADO ACTUAL DE LA BASE DE DATOS');
    console.log('='.repeat(60));

    // Usuarios
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { userStatus: 'ACTIVE' }
    });
    console.log(`\n👥 USUARIOS:`);
    console.log(`   - Total: ${totalUsers}`);
    console.log(`   - Activos: ${activeUsers}`);

    // Medallas
    const totalMedals = await prisma.medal.count();
    const enabledMedals = await prisma.medal.count({
      where: { status: 'ENABLED' }
    });
    const medalsWithPetName = await prisma.medal.count({
      where: { 
        petName: { not: '' }
      }
    });
    const medalsWithImage = await prisma.medal.count({
      where: { 
        image: { not: null }
      }
    });
    // phoneNumber ya no existe en Medal, se usa del User
    // Contamos medallas cuyo owner tiene phoneNumber
    const medalsWithPhone = await prisma.medal.count({
      where: {
        owner: {
          OR: [
            { phoneNumber: { not: null } },
            { phonenumber: { not: null } }
          ]
        }
      }
    });

    console.log(`\n🏅 MEDALLAS:`);
    console.log(`   - Total: ${totalMedals}`);
    console.log(`   - Estado ENABLED: ${enabledMedals}`);
    console.log(`   - Con nombre de mascota: ${medalsWithPetName}`);
    console.log(`   - Con imagen: ${medalsWithImage}`);
    console.log(`   - Con teléfono: ${medalsWithPhone}`);

    // Virgin Medals
    const totalVirginMedals = await prisma.virginMedal.count();
    const virginStatus = await prisma.virginMedal.groupBy({
      by: ['status'],
      _count: true
    });
    console.log(`\n🔖 MEDALLAS VÍRGENES:`);
    console.log(`   - Total: ${totalVirginMedals}`);
    virginStatus.forEach(s => {
      console.log(`   - Estado ${s.status}: ${s._count}`);
    });

    // Partners
    const totalPartners = await prisma.partner.count();
    const activePartners = await prisma.partner.count({
      where: { status: 'ACTIVE' }
    });
    console.log(`\n🏢 PARTNERS:`);
    console.log(`   - Total: ${totalPartners}`);
    console.log(`   - Activos: ${activePartners}`);

    // Scanned Medals
    const totalScanned = await prisma.scannedMedal.count();
    console.log(`\n📱 MEDALLAS ESCANEADAS:`);
    console.log(`   - Total: ${totalScanned}`);

    // Registration Attempts
    const totalAttempts = await prisma.registrationAttempt.count();
    console.log(`\n📝 INTENTOS DE REGISTRO:`);
    console.log(`   - Total: ${totalAttempts}`);

    // Ejemplos de medallas
    console.log(`\n📋 EJEMPLO DE MEDALLAS (primeras 3):`);
    const sampleMedals = await prisma.medal.findMany({
      take: 3,
      include: {
      owner: {
        select: {
          email: true,
          username: true,
          phoneNumber: true,
          phonenumber: true
        }
      }
      }
    });

    sampleMedals.forEach((medal, index) => {
      console.log(`\n   ${index + 1}. ${medal.medalString}`);
      console.log(`      - Estado: ${medal.status}`);
      console.log(`      - Mascota: ${medal.petName || '(sin nombre)'}`);
      console.log(`      - Descripción: ${medal.description ? (medal.description.substring(0, 30) + '...') : '(sin descripción)'}`);
      console.log(`      - Teléfono: ${medal.owner.phoneNumber || medal.owner.phonenumber || '(sin teléfono)'}`);
      console.log(`      - Imagen: ${medal.image ? '✅' : '❌'}`);
      console.log(`      - Owner: ${medal.owner.email} (${medal.owner.username || 'sin username'})`);
    });

    // Estructura de la tabla medals
    console.log(`\n📐 ESTRUCTURA DE LA TABLA MEDALS:`);
    const medalColumns = await prisma.$queryRaw<any[]>`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'medals'
      ORDER BY ordinal_position
    `;
    
    medalColumns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
      console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}`);
    });

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkDbStatus()
  .then(() => {
    console.log('\n✅ Verificación completada\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
