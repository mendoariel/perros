import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMedalColumns() {
    try {
        console.log('🔍 Verificando columnas en la tabla medals...\n');
        
        // Verificar si las columnas existen usando una query raw
        const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'medals' 
            AND table_schema = 'public'
            ORDER BY column_name;
        `;
        
        const columns = result.map(r => r.column_name);
        
        console.log('📋 Columnas actuales en la tabla medals:');
        columns.forEach(col => console.log(`   - ${col}`));
        
        const requiredColumns = ['pet_name', 'description', 'phone_number', 'image'];
        const missingColumns = requiredColumns.filter(col => !columns.includes(col));
        
        if (missingColumns.length > 0) {
            console.log('\n❌ Columnas faltantes:');
            missingColumns.forEach(col => console.log(`   - ${col}`));
            console.log('\n⚠️  Necesitas aplicar migraciones para agregar estas columnas.');
        } else {
            console.log('\n✅ Todas las columnas requeridas están presentes.');
        }
        
        // Verificar si existe petId (que debería eliminarse)
        if (columns.includes('pet_id')) {
            console.log('\n⚠️  La columna pet_id todavía existe. Debería eliminarse en la migración.');
        }
        
    } catch (error: any) {
        console.error('❌ Error verificando columnas:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkMedalColumns();
