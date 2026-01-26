
import { PrismaClient, MedalState } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const virginMedal = await prisma.virginMedal.findFirst({
        where: {
            status: MedalState.VIRGIN
        }
    });

    if (virginMedal) {
        console.log('🎉 Found a Virgin Medal:');
        console.log(`Medal String: ${virginMedal.medalString}`);
        console.log(`URL to test: http://localhost:4100/mascota-checking?medalString=${virginMedal.medalString}`);
    } else {
        console.log('❌ No Virgin Medals found. You might need to create one.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
