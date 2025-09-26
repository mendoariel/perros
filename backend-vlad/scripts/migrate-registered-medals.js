#!/usr/bin/env node

/**
 * Script para migrar medallas REGISTERED que estén completas a ENABLED
 * 
 * Este script identifica medallas en estado REGISTERED que tienen todos los datos
 * necesarios y las migra automáticamente a estado ENABLED.
 * 
 * Uso: node scripts/migrate-registered-medals.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Verifica si una medalla tiene todos los datos necesarios para estar completamente funcional
 */
function isMedalComplete(medal) {
    return !!(
        medal.petName && 
        medal.description && 
        medal.medalString && 
        medal.registerHash &&
        medal.petName.trim() !== '' &&
        medal.description.trim() !== ''
    );
}

async function migrateRegisteredMedals() {
    console.log('🔍 Buscando medallas REGISTERED que estén completas...\n');
    
    try {
        // Buscar medallas en estado REGISTERED
        const registeredMedals = await prisma.virginMedal.findMany({
            where: {
                status: 'REGISTERED'
            },
            include: {
                // No hay relación directa, necesitamos buscar en la tabla medals
            }
        });

        console.log(`📊 Encontradas ${registeredMedals.length} medallas en estado REGISTERED`);

        if (registeredMedals.length === 0) {
            console.log('✅ No hay medallas REGISTERED para migrar');
            return;
        }

        let migratedCount = 0;
        let skippedCount = 0;

        for (const virginMedal of registeredMedals) {
            try {
                // Buscar la medalla correspondiente en la tabla medals
                const medal = await prisma.medal.findUnique({
                    where: {
                        medalString: virginMedal.medalString
                    }
                });

                if (!medal) {
                    console.log(`⚠️  Medalla ${virginMedal.medalString}: No se encontró en tabla medals`);
                    skippedCount++;
                    continue;
                }

                // Verificar si la medalla está completa
                if (isMedalComplete(medal)) {
                    // Migrar a ENABLED
                    await prisma.$transaction(async (tx) => {
                        await tx.medal.update({
                            where: { medalString: medal.medalString },
                            data: { status: 'ENABLED' }
                        });

                        await tx.virginMedal.update({
                            where: { medalString: virginMedal.medalString },
                            data: { status: 'ENABLED' }
                        });
                    });

                    console.log(`✅ Migrada: ${medal.medalString} (${medal.petName})`);
                    migratedCount++;
                } else {
                    console.log(`⏭️  Saltada: ${medal.medalString} - Datos incompletos`);
                    skippedCount++;
                }
            } catch (error) {
                console.error(`❌ Error procesando medalla ${virginMedal.medalString}:`, error.message);
                skippedCount++;
            }
        }

        console.log('\n📈 Resumen de migración:');
        console.log(`✅ Migradas: ${migratedCount}`);
        console.log(`⏭️  Saltadas: ${skippedCount}`);
        console.log(`📊 Total procesadas: ${migratedCount + skippedCount}`);

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar el script
if (require.main === module) {
    migrateRegisteredMedals()
        .then(() => {
            console.log('\n🎉 Migración completada exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error en la migración:', error);
            process.exit(1);
        });
}

module.exports = { migrateRegisteredMedals, isMedalComplete };
