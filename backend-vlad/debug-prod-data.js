const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugData() {
    try {
        console.log('🔍 Checking RegistrationAttempts for mendoariel@gmail.com...');

        // Check if table exists (via raw query if needed, or try-catch)
        try {
            const attempts = await prisma.registrationAttempt.findMany({
                where: { email: { contains: 'mendoariel' } }
            });
            console.log('Found attempts:', attempts);
        } catch (e) {
            console.log('Error querying RegistrationAttempt (maybe table missing?):', e.message);
        }

        console.log('🔍 Checking ScannedMedals...');
        try {
            const scans = await prisma.scannedMedal.findMany({
                where: { medalString: 'test-prod-manual' }
            });
            console.log('Found scans:', scans);
        } catch (e) {
            console.log('Error querying ScannedMedal:', e.message);
        }

    } catch (error) {
        console.error('Generic Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugData();
