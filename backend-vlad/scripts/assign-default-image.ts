
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const DEFAULT_IMAGE_FILENAME = 'default-pet.png';

async function main() {
    console.log('🔍 Checking for pets without images...');

    // 1. Verify that the default image exists in the public/files directory
    const publicFilesDir = path.join(process.cwd(), 'public', 'files');
    const defaultImagePath = path.join(publicFilesDir, DEFAULT_IMAGE_FILENAME);

    if (!fs.existsSync(defaultImagePath)) {
        console.error(`❌ Error: Default image not found at ${defaultImagePath}`);
        console.error('   Please ensure create the image first.');
        process.exit(1);
    }

    console.log('✅ Default image found.');

    // 2. Find pets with null or empty images
    // We need to check both Medal and ScannedMedal/VirginMedal if applicable, 
    // but Medal is the primary source for the profile.

    const petsWithoutImage = await prisma.medal.findMany({
        where: {
            OR: [
                { image: null },
                { image: '' }
            ]
        }
    });

    console.log(`Found ${petsWithoutImage.length} pets without an image.`);

    if (petsWithoutImage.length === 0) {
        console.log('🎉 No pets need updating.');
        return;
    }

    // 3. Update them
    let updatedCount = 0;
    for (const pet of petsWithoutImage) {
        console.log(`Updating pet: ${pet.petName} (${pet.medalString})...`);
        await prisma.medal.update({
            where: { id: pet.id },
            data: { image: DEFAULT_IMAGE_FILENAME }
        });
        updatedCount++;
    }

    console.log('------------------------------------------------');
    console.log(`✅ Successfully updated ${updatedCount} pets with the default image.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
