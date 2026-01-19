import { PrismaClient, AttemptStatus, MedalState } from '@prisma/client';

const prisma = new PrismaClient();

// Timeout de 10 segundos para todas las operaciones
const TIMEOUT = 10000;

function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout);
        })
    ]);
}

async function testValidateEmail() {
    try {
        console.log('🧪 Iniciando test de validate-email...');
        
        // Test 1: Verificar que AttemptStatus existe
        console.log('\n1. Verificando AttemptStatus...');
        console.log('   AttemptStatus.PENDING:', AttemptStatus.PENDING);
        console.log('   AttemptStatus.CONFIRMED:', AttemptStatus.CONFIRMED);
        console.log('   AttemptStatus.EXPIRED:', AttemptStatus.EXPIRED);
        console.log('   ✅ AttemptStatus está disponible');
        
        // Test 2: Verificar que MedalState existe
        console.log('\n2. Verificando MedalState...');
        console.log('   MedalState.VIRGIN:', MedalState.VIRGIN);
        console.log('   MedalState.ENABLED:', MedalState.ENABLED);
        console.log('   ✅ MedalState está disponible');
        
        // Test 3: Verificar conexión a base de datos
        console.log('\n3. Verificando conexión a base de datos...');
        const virginMedalCount = await withTimeout(prisma.virginMedal.count(), TIMEOUT);
        console.log(`   ✅ Conexión OK. VirginMedals encontradas: ${virginMedalCount}`);
        
        // Test 4: Verificar que las tablas existen
        console.log('\n4. Verificando tablas...');
        const scannedMedalCount = await withTimeout(prisma.scannedMedal.count(), TIMEOUT);
        const registrationAttemptCount = await withTimeout(prisma.registrationAttempt.count(), TIMEOUT);
        console.log(`   ✅ scanned_medals: ${scannedMedalCount} registros`);
        console.log(`   ✅ registration_attempts: ${registrationAttemptCount} registros`);
        
        // Test 5: Intentar una query simple con AttemptStatus
        console.log('\n5. Probando query con AttemptStatus...');
        const attempts = await withTimeout(
            prisma.registrationAttempt.findMany({
                where: {
                    status: AttemptStatus.PENDING
                },
                take: 1
            }),
            TIMEOUT
        );
        console.log(`   ✅ Query exitosa. Intentos PENDING encontrados: ${attempts.length}`);
        
        // Test 6: Intentar una query con MedalState
        console.log('\n6. Probando query con MedalState...');
        const scannedMedals = await withTimeout(
            prisma.scannedMedal.findMany({
                where: {
                    status: MedalState.VIRGIN
                },
                take: 1
            }),
            TIMEOUT
        );
        console.log(`   ✅ Query exitosa. ScannedMedals VIRGIN encontradas: ${scannedMedals.length}`);
        
        console.log('\n✅ Todos los tests pasaron correctamente!');
        console.log('\n⚠️  Si el servidor sigue fallando, verifica:');
        console.log('   1. Que el servidor se haya reiniciado después de los cambios');
        console.log('   2. Que Prisma Client esté actualizado: npx prisma generate');
        console.log('   3. Los logs del servidor para ver el error específico');
        
    } catch (error) {
        console.error('\n❌ Error en el test:', error);
        console.error('\nDetalles del error:');
        console.error('   Mensaje:', error.message);
        if (error.stack) {
            console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
        }
        
        if (error.message.includes('AttemptStatus')) {
            console.error('\n⚠️  PROBLEMA: AttemptStatus no está disponible');
            console.error('   Solución: Ejecuta "npx prisma generate" en backend-vlad');
        }
        
        if (error.message.includes('MedalState')) {
            console.error('\n⚠️  PROBLEMA: MedalState no está disponible');
            console.error('   Solución: Ejecuta "npx prisma generate" en backend-vlad');
        }
        
        if (error.message.includes('registration_attempts')) {
            console.error('\n⚠️  PROBLEMA: La tabla registration_attempts no existe');
            console.error('   Solución: Ejecuta las migraciones de Prisma');
        }
        
        if (error.message.includes('timed out')) {
            console.error('\n⚠️  PROBLEMA: La operación tardó más de 10 segundos');
            console.error('   Posible causa: Base de datos no disponible o conexión lenta');
        }
        
        throw error;
    } finally {
        try {
            await withTimeout(prisma.$disconnect(), 5000);
        } catch (e) {
            // Ignorar errores al desconectar
        }
    }
}

// Ejecutar con timeout total de 30 segundos
const TOTAL_TIMEOUT = 30000;
Promise.race([
    testValidateEmail(),
    new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test took too long, aborting')), TOTAL_TIMEOUT);
    })
])
    .then(() => {
        console.log('\n✅ Test completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test falló:', error.message);
        process.exit(1);
    });

