const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_EMAIL = 'mendoariel@gmail.com';

async function cleanupUser() {
    try {
        console.log(`🚀 Starting cleanup for user: ${TARGET_EMAIL}`);

        const user = await prisma.user.findFirst({
            where: { email: TARGET_EMAIL },
            include: {
                scannedMedals: true,
                medals: true // Assuming relation exists, checking schema availability
            }
        });

        if (!user) {
            console.log('❌ User not found. Checking for orphan registration attempts...');
        } else {
            console.log(`✅ User found: ID ${user.id}`);
        }

        // 1. Find all medal strings associated with this user (via Medal or ScannedMedal)
        const medalStringsToReset = new Set();

        if (user) {
            // From Medals table (if it exists on User)
            // Check if medals relation is loaded
            const userWithMedals = await prisma.user.findUnique({
                where: { id: user.id },
                include: { medals: true } // Relation name might vary, assuming 'medals' based on previous context
            });

            if (userWithMedals && userWithMedals.medals) {
                userWithMedals.medals.forEach(m => medalStringsToReset.add(m.medalString));
            }

            // From ScannedMedal relation
            const userWithScans = await prisma.user.findUnique({
                where: { id: user.id },
                include: { scannedMedals: true }
            });

            if (userWithScans && userWithScans.scannedMedals) {
                userWithScans.scannedMedals.forEach(sm => medalStringsToReset.add(sm.medalString));
            }
        }

        // Also check RegistrationAttempts for this email to find other medal strings
        const attempts = await prisma.registrationAttempt.findMany({
            where: { email: TARGET_EMAIL }
        });
        attempts.forEach(a => medalStringsToReset.add(a.medalString));

        console.log(`📋 Medal strings to reset to VIRGIN:`, Array.from(medalStringsToReset));

        await prisma.$transaction(async (tx) => {
            // 2. Reset VirginMedals
            if (medalStringsToReset.size > 0) {
                const resetResult = await tx.virginMedal.updateMany({
                    where: { medalString: { in: Array.from(medalStringsToReset) } },
                    data: { status: 'VIRGIN' }
                });
                console.log(`🔄 Reset ${resetResult.count} virgin medals to VIRGIN.`);
            }

            // 3. Delete RegistrationAttempts (Cascade from ScannedMedal usually, but lets be sure for orphans)
            const deletedAttempts = await tx.registrationAttempt.deleteMany({
                where: { email: TARGET_EMAIL }
            });
            console.log(`🗑️  Deleted ${deletedAttempts.count} registration attempts.`);

            if (user) {
                // 4. Delete Medals (Owned by user)
                const deletedMedals = await tx.medal.deleteMany({
                    where: { ownerId: user.id }
                });
                console.log(`🗑️  Deleted ${deletedMedals.count} medals.`);

                // 5. Delete ScannedMedals (Linked to user)
                // Note: If RegistrationAttempt cascades from ScannedMedal, good. If not, we deleted them above.
                const deletedScans = await tx.scannedMedal.deleteMany({
                    where: { userId: user.id }
                });
                console.log(`🗑️  Deleted ${deletedScans.count} scanned medals.`);

                // 6. Delete User
                await tx.user.delete({
                    where: { id: user.id }
                });
                console.log(`✅ User ${user.email} (ID: ${user.id}) deleted.`);
            }
        });

        console.log('🎉 Cleanup completed successfully.');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupUser();
