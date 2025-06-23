const { PrismaClient } = require('@prisma/client');

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
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error inserting medal:', error);
  }
}

insertVirginMedal(); 