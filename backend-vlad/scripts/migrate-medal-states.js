/**
 * Script para migrar estados de medallas después de eliminar REGISTERED y PENDING_CONFIRMATION
 * 
 * Este script:
 * 1. Actualiza medallas con estado REGISTERED a INCOMPLETE
 * 2. Actualiza medallas con estado PENDING_CONFIRMATION a REGISTER_PROCESS
 * 3. Verifica que no queden estados inválidos
 * 
 * Ejecutar con: node scripts/migrate-medal-states.js
 */

const { PrismaClient, MedalState } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateMedalStates() {
    console.log('🔄 Iniciando migración de estados de medallas...\n');

    try {
        // 1. Contar medallas con estados a migrar
        const medalsRegistered = await prisma.medal.count({
            where: { status: 'REGISTERED' }
        });
        const medalsPending = await prisma.medal.count({
            where: { status: 'PENDING_CONFIRMATION' }
        });
        const virginRegistered = await prisma.virginMedal.count({
            where: { status: 'REGISTERED' }
        });
        const virginPending = await prisma.virginMedal.count({
            where: { status: 'PENDING_CONFIRMATION' }
        });

        console.log('📊 Estados a migrar:');
        console.log(`   medals REGISTERED: ${medalsRegistered}`);
        console.log(`   medals PENDING_CONFIRMATION: ${medalsPending}`);
        console.log(`   virgin_medals REGISTERED: ${virginRegistered}`);
        console.log(`   virgin_medals PENDING_CONFIRMATION: ${virginPending}\n`);

        // 2. Actualizar REGISTERED a INCOMPLETE
        if (medalsRegistered > 0) {
            const result = await prisma.medal.updateMany({
                where: { status: 'REGISTERED' },
                data: { status: 'INCOMPLETE' }
            });
            console.log(`✅ Actualizadas ${result.count} medallas: REGISTERED → INCOMPLETE`);
        }

        if (virginRegistered > 0) {
            const result = await prisma.virginMedal.updateMany({
                where: { status: 'REGISTERED' },
                data: { status: 'INCOMPLETE' }
            });
            console.log(`✅ Actualizadas ${result.count} virgin_medals: REGISTERED → INCOMPLETE`);
        }

        // 3. Actualizar PENDING_CONFIRMATION a REGISTER_PROCESS
        if (medalsPending > 0) {
            const result = await prisma.medal.updateMany({
                where: { status: 'PENDING_CONFIRMATION' },
                data: { status: 'REGISTER_PROCESS' }
            });
            console.log(`✅ Actualizadas ${result.count} medallas: PENDING_CONFIRMATION → REGISTER_PROCESS`);
        }

        if (virginPending > 0) {
            const result = await prisma.virginMedal.updateMany({
                where: { status: 'PENDING_CONFIRMATION' },
                data: { status: 'REGISTER_PROCESS' }
            });
            console.log(`✅ Actualizadas ${result.count} virgin_medals: PENDING_CONFIRMATION → REGISTER_PROCESS`);
        }

        // 4. Verificar que no queden estados inválidos
        const remainingRegistered = await prisma.medal.count({
            where: { status: 'REGISTERED' }
        });
        const remainingPending = await prisma.medal.count({
            where: { status: 'PENDING_CONFIRMATION' }
        });
        const remainingVirginRegistered = await prisma.virginMedal.count({
            where: { status: 'REGISTERED' }
        });
        const remainingVirginPending = await prisma.virginMedal.count({
            where: { status: 'PENDING_CONFIRMATION' }
        });

        console.log('\n🔍 Verificación final:');
        if (remainingRegistered === 0 && remainingPending === 0 && 
            remainingVirginRegistered === 0 && remainingVirginPending === 0) {
            console.log('✅ Migración completada exitosamente. No quedan estados inválidos.');
        } else {
            console.log('⚠️  Advertencia: Aún quedan estados inválidos:');
            if (remainingRegistered > 0) console.log(`   medals REGISTERED: ${remainingRegistered}`);
            if (remainingPending > 0) console.log(`   medals PENDING_CONFIRMATION: ${remainingPending}`);
            if (remainingVirginRegistered > 0) console.log(`   virgin_medals REGISTERED: ${remainingVirginRegistered}`);
            if (remainingVirginPending > 0) console.log(`   virgin_medals PENDING_CONFIRMATION: ${remainingVirginPending}`);
        }

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar migración
migrateMedalStates()
    .then(() => {
        console.log('\n🎉 Migración finalizada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error en la migración:', error);
        process.exit(1);
    });

