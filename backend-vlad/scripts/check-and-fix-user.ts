import { PrismaClient, UserStatus, Role } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndFixUser() {
  try {
    const email = 'albertdesarrolloweb@gmail.com';
    const password = 'Yamaha600';
    
    console.log(`🔍 Verificando usuario: ${email}\n`);
    
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
        console.log('\n💡 Creando usuario...');
        
        const hash = bcrypt.hashSync(password, 10);
        const newUser = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            hash: hash,
            userStatus: UserStatus.ACTIVE,
            role: Role.VISITOR,
            hashToRegister: 'temp-' + Date.now()
          }
        });
        
        console.log('✅ Usuario creado exitosamente:');
        console.log(`   - ID: ${newUser.id}`);
        console.log(`   - Email: ${newUser.email}`);
        console.log(`   - Status: ${newUser.userStatus}`);
        console.log(`   - Role: ${newUser.role}`);
      } else {
        allUsers.forEach(u => {
          console.log(`   - ${u.email} (Status: ${u.userStatus}, Role: ${u.role}, ID: ${u.id})`);
        });
        console.log('\n💡 El usuario no existe. ¿Quieres crearlo? (Edita el script para habilitar la creación)');
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
        console.log('\n💡 Actualizando usuario a ACTIVE...');
        
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { userStatus: UserStatus.ACTIVE }
        });
        
        console.log('✅ Usuario actualizado a ACTIVE');
        console.log(`   - Nuevo Status: ${updatedUser.userStatus}`);
      } else {
        console.log('\n✅ El usuario está ACTIVE');
        console.log('   Verificando contraseña...');
        
        const passwordMatch = bcrypt.compareSync(password, user.hash);
        if (passwordMatch) {
          console.log('✅ La contraseña es correcta');
          console.log('   El login debería funcionar ahora.');
        } else {
          console.log('❌ La contraseña NO coincide');
          console.log('   Esto explica el error 403.');
          console.log('\n💡 ¿Quieres actualizar la contraseña? (Edita el script para habilitar)');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixUser();
