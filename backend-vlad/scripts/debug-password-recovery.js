/**
 * Script para diagnosticar problemas con recuperación de contraseña
 * 
 * Uso: node scripts/debug-password-recovery.js <email> <hash>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugPasswordRecovery(email, hash) {
    console.log('🔍 Diagnosticando recuperación de contraseña...\n');
    console.log(`Email: ${email}`);
    console.log(`Hash recibido: ${hash}\n`);

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email.toLowerCase()
            },
            select: {
                id: true,
                email: true,
                hashPasswordRecovery: true,
                userStatus: true,
                createdAt: true
            }
        });

        if (!user) {
            console.log('❌ Usuario NO encontrado');
            console.log('   El email no existe en la base de datos');
            return;
        }

        console.log('✅ Usuario encontrado:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Estado: ${user.userStatus}`);
        console.log(`   Hash en BD: ${user.hashPasswordRecovery || '(null)'}`);
        console.log(`   Hash recibido: ${hash}`);
        console.log(`   Coinciden: ${user.hashPasswordRecovery === hash ? '✅ SÍ' : '❌ NO'}\n`);

        if (!user.hashPasswordRecovery) {
            console.log('⚠️  PROBLEMA: El hash de recuperación es NULL');
            console.log('   Esto significa que:');
            console.log('   - El enlace ya fue usado, o');
            console.log('   - El usuario nunca solicitó recuperación de contraseña\n');
        } else if (user.hashPasswordRecovery !== hash) {
            console.log('⚠️  PROBLEMA: Los hashes NO coinciden');
            console.log('   Esto significa que:');
            console.log('   - El enlace es inválido o expirado, o');
            console.log('   - Se solicitó un nuevo enlace después de este\n');
        } else {
            console.log('✅ Todo está correcto');
            console.log('   El hash coincide y está disponible para usar\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Obtener argumentos de la línea de comandos
const email = process.argv[2];
const hash = process.argv[3];

if (!email || !hash) {
    console.log('Uso: node scripts/debug-password-recovery.js <email> <hash>');
    console.log('\nEjemplo:');
    console.log('node scripts/debug-password-recovery.js albertdesarrolloweb@gmail.com 2oszLoMnMKj2JMgH2N2JSnrQU6JkuW');
    process.exit(1);
}

debugPasswordRecovery(email, hash);

