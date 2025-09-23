/**
 * Script para identificar y corregir usuarios PENDING con medallas ENABLED
 * 
 * Este script identifica la inconsistencia donde usuarios tienen estado PENDING
 * pero sus medallas están marcadas como ENABLED, lo cual no debería ser posible.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findInconsistentUsers() {
    console.log('🔍 Buscando usuarios PENDING con medallas ENABLED...\n');
    
    try {
        // Buscar usuarios PENDING que tengan medallas ENABLED
        const inconsistentUsers = await prisma.user.findMany({
            where: {
                userStatus: 'PENDING',
                medals: {
                    some: {
                        status: 'ENABLED'
                    }
                }
            },
            include: {
                medals: {
                    where: {
                        status: 'ENABLED'
                    }
                }
            }
        });

        if (inconsistentUsers.length === 0) {
            console.log('✅ No se encontraron usuarios con esta inconsistencia.');
            return;
        }

        console.log(`❌ Se encontraron ${inconsistentUsers.length} usuarios con inconsistencia:\n`);

        for (const user of inconsistentUsers) {
            console.log(`👤 Usuario: ${user.email}`);
            console.log(`   Estado: ${user.userStatus}`);
            console.log(`   Medallas ENABLED: ${user.medals.length}`);
            user.medals.forEach(medal => {
                console.log(`   - ${medal.medalString} (${medal.petName})`);
            });
            console.log('');
        }

        return inconsistentUsers;
    } catch (error) {
        console.error('❌ Error buscando usuarios inconsistentes:', error);
        throw error;
    }
}

async function fixInconsistentUsers(users) {
    if (!users || users.length === 0) {
        console.log('✅ No hay usuarios para corregir.');
        return;
    }

    console.log('🔧 Iniciando corrección de inconsistencias...\n');

    for (const user of users) {
        try {
            console.log(`🔧 Corrigiendo usuario: ${user.email}`);
            
            // Opción 1: Cambiar medallas a INCOMPLETE (recomendado)
            // Esto permite que el usuario complete el proceso de confirmación
            await prisma.medal.updateMany({
                where: {
                    ownerId: user.id,
                    status: 'ENABLED'
                },
                data: {
                    status: 'INCOMPLETE'
                }
            });

            // También actualizar virgin medals
            const medalStrings = user.medals.map(m => m.medalString);
            await prisma.virginMedal.updateMany({
                where: {
                    medalString: {
                        in: medalStrings
                    }
                },
                data: {
                    status: 'REGISTERED'
                }
            });

            console.log(`   ✅ Medallas cambiadas a INCOMPLETE para ${user.email}`);
            
        } catch (error) {
            console.error(`   ❌ Error corrigiendo usuario ${user.email}:`, error);
        }
    }

    console.log('\n✅ Corrección completada.');
}

async function main() {
    try {
        console.log('🚀 Iniciando verificación de consistencia de usuarios...\n');
        
        const inconsistentUsers = await findInconsistentUsers();
        await fixInconsistentUsers(inconsistentUsers);
        
        console.log('\n🎉 Proceso completado exitosamente.');
        
    } catch (error) {
        console.error('💥 Error en el proceso:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
    main();
}

module.exports = {
    findInconsistentUsers,
    fixInconsistentUsers
};
