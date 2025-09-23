/**
 * Script para identificar usuarios huérfanos (sin medallas)
 * 
 * Este script identifica usuarios que no tienen medallas asociadas,
 * lo cual puede ocurrir debido al bug en el flujo de reset de medalla.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findOrphanedUsers() {
    console.log('🔍 Buscando usuarios huérfanos (sin medallas)...\n');
    
    try {
        // Buscar usuarios que no tienen medallas asociadas
        const orphanedUsers = await prisma.user.findMany({
            where: {
                medals: {
                    none: {}
                }
            },
            include: {
                medals: true
            }
        });

        if (orphanedUsers.length === 0) {
            console.log('✅ No se encontraron usuarios huérfanos.');
            return [];
        }

        console.log(`❌ Se encontraron ${orphanedUsers.length} usuarios huérfanos:\n`);

        for (const user of orphanedUsers) {
            console.log(`👤 Usuario ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Estado: ${user.userStatus}`);
            console.log(`   Creado: ${user.createdAt}`);
            console.log(`   Medallas: ${user.medals.length}`);
            console.log('');
        }

        return orphanedUsers;
    } catch (error) {
        console.error('❌ Error buscando usuarios huérfanos:', error);
        throw error;
    }
}

async function analyzeOrphanedUsers(users) {
    if (!users || users.length === 0) {
        console.log('✅ No hay usuarios huérfanos para analizar.');
        return;
    }

    console.log('📊 Análisis de usuarios huérfanos:\n');

    const statusCounts = {};
    const recentOrphans = [];
    const oldOrphans = [];

    for (const user of users) {
        // Contar por estado
        statusCounts[user.userStatus] = (statusCounts[user.userStatus] || 0) + 1;

        // Separar por antigüedad (más de 30 días = viejo)
        const daysSinceCreation = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
        
        if (daysSinceCreation > 30) {
            oldOrphans.push(user);
        } else {
            recentOrphans.push(user);
        }
    }

    console.log('📈 Distribución por estado:');
    Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} usuarios`);
    });

    console.log(`\n📅 Distribución por antigüedad:`);
    console.log(`   Recientes (≤30 días): ${recentOrphans.length} usuarios`);
    console.log(`   Antiguos (>30 días): ${oldOrphans.length} usuarios`);

    return {
        statusCounts,
        recentOrphans,
        oldOrphans
    };
}

async function suggestCleanupActions(analysis) {
    if (!analysis) {
        console.log('✅ No se requieren acciones de limpieza.');
        return;
    }

    console.log('\n🧹 Sugerencias de limpieza:\n');

    // Sugerir eliminar usuarios PENDING antiguos
    const oldPendingUsers = analysis.oldOrphans.filter(u => u.userStatus === 'PENDING');
    if (oldPendingUsers.length > 0) {
        console.log(`🗑️  Considerar eliminar ${oldPendingUsers.length} usuarios PENDING antiguos:`);
        oldPendingUsers.forEach(user => {
            const days = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
            console.log(`   - ${user.email} (${days} días)`);
        });
        console.log('');
    }

    // Sugerir revisar usuarios ACTIVE
    const activeOrphans = analysis.recentOrphans.filter(u => u.userStatus === 'ACTIVE');
    if (activeOrphans.length > 0) {
        console.log(`⚠️  Revisar ${activeOrphans.length} usuarios ACTIVE recientes (pueden ser legítimos):`);
        activeOrphans.forEach(user => {
            const days = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
            console.log(`   - ${user.email} (${days} días)`);
        });
        console.log('');
    }

    console.log('💡 Recomendaciones:');
    console.log('   1. Usuarios PENDING antiguos (>30 días) pueden eliminarse de forma segura');
    console.log('   2. Usuarios ACTIVE recientes deben revisarse manualmente');
    console.log('   3. Ejecutar este script regularmente para monitorear el problema');
}

async function main() {
    try {
        console.log('🚀 Iniciando análisis de usuarios huérfanos...\n');
        
        const orphanedUsers = await findOrphanedUsers();
        const analysis = await analyzeOrphanedUsers(orphanedUsers);
        await suggestCleanupActions(analysis);
        
        console.log('\n🎉 Análisis completado exitosamente.');
        
    } catch (error) {
        console.error('💥 Error en el análisis:', error);
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
    findOrphanedUsers,
    analyzeOrphanedUsers,
    suggestCleanupActions
};
