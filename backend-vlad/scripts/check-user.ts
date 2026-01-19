import { PrismaClient, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = 'albertdesarrolloweb@gmail.com';
    
    console.log(`🔍 Buscando usuario: ${email}\n`);
    
    // Buscar usuario sin filtrar por status
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      }
    });
    
    if (!user) {
      console.log('❌ Usuario NO encontrado en la base de datos');
      console.log('\n📊 Usuarios existentes en la base de datos:');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          userStatus: true,
          role: true,
          createdAt: true
        },
        take: 10
      });
      
      if (allUsers.length === 0) {
        console.log('   ⚠️  No hay usuarios en la base de datos');
      } else {
        allUsers.forEach(u => {
          console.log(`   - ${u.email} (Status: ${u.userStatus}, Role: ${u.role}, ID: ${u.id})`);
        });
      }
    } else {
      console.log('✅ Usuario encontrado:');
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Status: ${user.userStatus}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Creado: ${user.createdAt}`);
      
      if (user.userStatus !== UserStatus.ACTIVE) {
        console.log(`\n⚠️  El usuario NO está ACTIVE, está en estado: ${user.userStatus}`);
        console.log('   Esto explica el error 403 en el login.');
        console.log('\n💡 Opciones:');
        console.log('   1. Actualizar el usuario a ACTIVE');
        console.log('   2. Confirmar la cuenta si está en PENDING');
      } else {
        console.log('\n✅ El usuario está ACTIVE');
        console.log('   El problema podría ser la contraseña.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
