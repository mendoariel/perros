import { PrismaClient } from '@prisma/client';

async function insertVirginMedal() {
  const prisma = new PrismaClient();
  
  try {
    const newMedal = await prisma.virginMedal.create({
      data: {
        medalString: 'rosa',
        registerHash: 'cursor_from',
        status: 'VIRGIN',
      },
    });
  } catch (error) {
    console.error('Error inserting medal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertVirginMedal(); 