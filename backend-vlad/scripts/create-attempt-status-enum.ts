import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAttemptStatusEnum() {
  try {
    console.log('🔍 Verificando enum AttemptStatus...\n');
    
    // Verificar si el enum existe
    const enumExists = await prisma.$queryRaw<Array<{ typname: string }>>`
      SELECT typname 
      FROM pg_type 
      WHERE typname = 'AttemptStatus';
    `;
    
    if (enumExists.length > 0) {
      console.log('✅ El enum AttemptStatus ya existe');
      return;
    }
    
    console.log('📦 Creando enum AttemptStatus...\n');
    
    // Crear el enum
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "AttemptStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED');
    `);
    
    console.log('✅ Enum AttemptStatus creado exitosamente');
    
  } catch (error: any) {
    if (error?.code === '42710' || error?.message?.includes('already exists')) {
      console.log('✅ El enum AttemptStatus ya existe');
    } else {
      console.error('❌ Error:', error?.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAttemptStatusEnum();
