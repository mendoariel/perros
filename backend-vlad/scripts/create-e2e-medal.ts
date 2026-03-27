import { PrismaClient } from '@prisma/client';

async function seedE2EMedal() {
  const prisma = new PrismaClient();
  try {
    // Clean up if it already exists to be safe
    await prisma.virginMedal.deleteMany({
      where: { medalString: 'test-e2e-medal' }
    });
    
    // Create the test medal
    await prisma.virginMedal.create({
      data: {
        medalString: 'test-e2e-medal',
        registerHash: 'e2e_register_hash',
        status: 'VIRGIN',
      },
    });
    console.log('Successfully seeded test-e2e-medal');
  } catch (error) {
    console.error('Error seeding E2E medal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedE2EMedal();
