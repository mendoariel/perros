const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createVirginMedal() {
    try {
        console.log('🚀 Creating VIRGIN medal for testing...');

        const testMedalString = 'test-virgin-medal-' + Date.now();

        // Create a medal in VirginMedal with status VIRGIN
        const virginMedal = await prisma.virginMedal.create({
            data: {
                medalString: testMedalString,
                status: 'VIRGIN',
                registerHash: 'test-hash-' + Date.now(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        console.log('✅ VirginMedal created:', virginMedal.medalString);
        console.log('\n🎯 Test Link:');
        console.log(`http://localhost:4100/mascota-checking?medalString=${testMedalString}`);

        return testMedalString;

    } catch (error) {
        console.error('❌ Error creating virgin medal:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createVirginMedal()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
