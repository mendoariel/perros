import { PrismaClient } from '@prisma/client';

async function cleanupE2E() {
  const prisma = new PrismaClient();
  try {
    const userEmail = 'test-e2e-user@gmail.com';
    const medalString = 'test-e2e-medal';

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { pets: true }
    });

    if (user) {
      if (user.pets.length > 0) {
        // Find pets and delete their medals and the pets themselves
        for (const pet of user.pets) {
          await prisma.medal.deleteMany({ where: { petId: pet.id } });
          await prisma.pet.delete({ where: { id: pet.id } });
        }
      }
      await prisma.user.delete({ where: { email: userEmail } });
      console.log('Cleaned up E2E user and pets');
    }

    // Delete virgin medal if left unused
    await prisma.virginMedal.deleteMany({
      where: { medalString: medalString }
    });
    
    console.log('Successfully cleaned up E2E data');
  } catch (error) {
    console.error('Error cleaning up E2E data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupE2E();
