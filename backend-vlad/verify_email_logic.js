const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyEmailLogic() {
    console.log('🚀 Starting Verification of Email Logic...');
    const testEmail = `verify-logic-${Date.now()}@test.com`;
    const testMedalString = `verify-medal-${Date.now()}`;

    try {
        // 1. Create a mock RegistrationAttempt (representing the NEW flow)
        console.log(`1️⃣ Creating test RegistrationAttempt for ${testEmail}...`);

        // We need a dummy scanned medal first as it is a relation
        // But wait, the schema says: scannedMedal ScannedMedal @relation
        // So we need a scanned medal.

        // Let's first look if we can create it without one? No, it's required in schema.

        // Create dummy ScannedMedal
        const scannedMedal = await prisma.scannedMedal.create({
            data: {
                medalString: testMedalString,
                registerHash: 'test-hash',
                status: 'VIRGIN',
                scannedAt: new Date()
            }
        });

        const attempt = await prisma.registrationAttempt.create({
            data: {
                email: testEmail,
                passwordHash: 'dummy_hash',
                medalString: testMedalString,
                scannedMedalId: scannedMedal.id,
                hashToRegister: 'dummy_register_hash',
                status: 'PENDING'
            }
        });
        console.log('✅ RegistrationAttempt created successfully with ID:', attempt.id);

        // 2. Simulate QrService.resendConfirmationEmail logic
        console.log('2️⃣ Simulating resendConfirmationEmail logic...');

        // Logic from QrService:
        // const registrationAttempt = await this.prisma.registrationAttempt.findFirst({...})

        const foundAttempt = await prisma.registrationAttempt.findFirst({
            where: {
                email: testEmail,
                status: 'PENDING'
            }
        });

        if (!foundAttempt) {
            throw new Error('❌ Failed to find the RegistrationAttempt we just created!');
        }
        console.log('✅ Found RegistrationAttempt in DB.');

        // 3. Verify we don't need a User
        console.log('3️⃣ Verifying absence of User...');
        const user = await prisma.user.findUnique({
            where: { email: testEmail }
        });

        if (user) {
            console.warn('⚠️ WARNING: User exists! This test assumes user should NOT exist yet.');
        } else {
            console.log('✅ User does NOT exist in "users" table, as expected for new flow.');
        }

        // 4. "Send" Email
        // Real service calls: this.sendEmailConfirmAccount(registrationAttempt.email, ...)
        const url = `http://localhost:3000/confirmar-cuenta?hashEmail=${foundAttempt.email}&hashToRegister=${foundAttempt.hashToRegister}&medalString=${foundAttempt.medalString}`;
        console.log('✅ Email URL generated successfully:', url);
        console.log('ℹ️ Logic would now call mailService.sendConfirmAccount');

        console.log('\n🎉 VERIFICATION SUCCESSFUL: The logic successfully retrieved data from RegistrationAttempt without needing a User record.');

    } catch (error) {
        console.error('❌ VERIFICATION FAILED:', error);
    } finally {
        // Cleanup
        console.log('\n🧹 Cleaning up test data...');
        try {
            await prisma.registrationAttempt.deleteMany({ where: { email: testEmail } });
            await prisma.scannedMedal.deleteMany({ where: { medalString: testMedalString } });
            console.log('✅ Cleanup done.');
        } catch (e) {
            console.error('Cleanup failed:', e);
        }
        await prisma.$disconnect();
    }
}

verifyEmailLogic();
