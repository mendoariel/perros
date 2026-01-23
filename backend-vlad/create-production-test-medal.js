const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
// It will automatically pick up DATABASE_URL from the environment or .env file
const prisma = new PrismaClient();

const MEDAL_STRING = 'test-prod-manual';

async function createProductionTestMedal() {
    try {
        console.log(`🚀 Iniciando creación de medalla de prueba para PRODUCCIÓN...`);
        console.log(`Target Medal String: ${MEDAL_STRING}`);

        // 1. Check if it already exists to avoid errors
        const existing = await prisma.virginMedal.findFirst({
            where: { medalString: MEDAL_STRING }
        });

        if (existing) {
            console.log(`⚠️ La medalla '${MEDAL_STRING}' ya existe.`);
            console.log(`Estado actual: ${existing.status}`);

            // If it exists but is not VIRGIN, we might want to reset it for the test
            if (existing.status !== 'VIRGIN') {
                console.log('🔄 Reseteando estado a VIRGIN...');
                await prisma.virginMedal.update({
                    where: { id: existing.id },
                    data: {
                        status: 'VIRGIN',
                        // Clean up potentially related data if needed logic was here, 
                        // but for safety we just reset status for now.
                    }
                });
                console.log('✅ Estado reseteado a VIRGIN.');
            }
            return;
        }

        // 2. Create the Virgin Medal
        const registerHash = 'hash-prod-' + Date.now();

        const newMedal = await prisma.virginMedal.create({
            data: {
                medalString: MEDAL_STRING,
                status: 'VIRGIN',
                registerHash: registerHash,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        console.log('✅ Medalla Creada Exitosamente!');
        console.log('-------------------------------------------');
        console.log('ID:', newMedal.id);
        console.log('Medal String:', newMedal.medalString);
        console.log('Register Hash:', newMedal.registerHash);
        console.log('Status:', newMedal.status);
        console.log('-------------------------------------------');
        console.log('🔗 LINK PARA PROBAR EN PRODUCCIÓN:');
        console.log(`https://peludosclick.com/mascota-checking?medalString=${MEDAL_STRING}`);
        console.log('-------------------------------------------');

    } catch (error) {
        console.error('❌ Error creando la medalla:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Execute
createProductionTestMedal();
