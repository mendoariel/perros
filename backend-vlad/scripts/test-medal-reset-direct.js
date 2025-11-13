/**
 * Script de prueba directa para el reseteo de medalla
 * 
 * Este script prueba la funcionalidad de reseteo directamente contra la base de datos,
 * sin depender del backend corriendo. Útil para debugging.
 * 
 * Uso:
 *   node scripts/test-medal-reset-direct.js <medalString> [userEmail]
 * 
 * Ejemplo:
 *   node scripts/test-medal-reset-direct.js TEST123 test@example.com
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(title, 'bright');
  log('='.repeat(60), 'cyan');
}

async function checkMedalStatus(medalString) {
  logSection('📊 Estado Actual de la Medalla');
  
  const virginMedal = await prisma.virginMedal.findFirst({
    where: { medalString }
  });

  if (!virginMedal) {
    log(`❌ No se encontró virgin_medal con medalString: ${medalString}`, 'red');
    return null;
  }

  log(`✅ Virgin Medal encontrada:`, 'green');
  log(`   - ID: ${virginMedal.id}`);
  log(`   - Status: ${virginMedal.status}`, virginMedal.status === 'REGISTERED' ? 'red' : 'yellow');
  log(`   - Register Hash: ${virginMedal.registerHash}`);
  log(`   - Created At: ${virginMedal.createdAt}`);

  const registeredMedal = await prisma.medal.findFirst({
    where: { medalString },
    include: {
      owner: true
    }
  });

  if (registeredMedal) {
    log(`\n✅ Medal registrada encontrada:`, 'green');
    log(`   - ID: ${registeredMedal.id}`);
    log(`   - Status: ${registeredMedal.status}`);
    log(`   - Pet Name: ${registeredMedal.petName}`);
    log(`   - Owner ID: ${registeredMedal.ownerId}`);
    log(`   - Owner Email: ${registeredMedal.owner.email}`);

    // Contar medallas del usuario
    const userMedals = await prisma.medal.findMany({
      where: { ownerId: registeredMedal.ownerId }
    });
    log(`   - Total medallas del usuario: ${userMedals.length}`);
  } else {
    log(`\nℹ️  No hay medal registrada para este medalString`, 'blue');
  }

  return { virginMedal, registeredMedal };
}

async function processMedalResetDirect(medalString, userEmail) {
  logSection('🔄 Ejecutando Reset de Medalla (Directo)');

  const startTime = Date.now();
  
  try {
    // 1. Verificar que la medalla existe
    const virginMedal = await prisma.virginMedal.findFirst({
      where: { medalString }
    });

    if (!virginMedal) {
      throw new Error('Medalla no encontrada');
    }

    log(`✅ Medalla encontrada: ${virginMedal.status}`, 'green');

    // 2. Verificar que el estado permite reset
    const allowedStates = ['REGISTER_PROCESS', 'PENDING_CONFIRMATION', 'INCOMPLETE'];
    if (!allowedStates.includes(virginMedal.status)) {
      log(`⚠️  ADVERTENCIA: El estado actual (${virginMedal.status}) NO permite reset`, 'yellow');
      log(`   Estados permitidos: ${allowedStates.join(', ')}`, 'yellow');
      log(`   Continuando de todas formas para testing...`, 'yellow');
    }

    // 3. Buscar si existe una medalla registrada
    const registeredMedal = await prisma.medal.findFirst({
      where: { medalString },
      include: {
        owner: true
      }
    });

    if (registeredMedal) {
      log(`✅ Medalla registrada encontrada. Owner: ${registeredMedal.owner.email}`, 'green');
    }

    // 4. Iniciar transacción con timeout
    log(`\n⏳ Iniciando transacción...`, 'blue');
    
    const transactionTimeout = 30000; // 30 segundos
    const transactionPromise = prisma.$transaction(async (prisma) => {
      log(`   → Actualizando virgin_medal a VIRGIN...`, 'blue');
      await prisma.virginMedal.update({
        where: { medalString },
        data: { 
          status: 'VIRGIN'
        }
      });
      log(`   ✅ Virgin medal actualizada`, 'green');

      if (registeredMedal) {
        log(`   → Consultando medallas del usuario...`, 'blue');
        const userMedals = await prisma.medal.findMany({
          where: { ownerId: registeredMedal.ownerId }
        });
        log(`   ✅ Usuario tiene ${userMedals.length} medalla(s)`, 'green');

        log(`   → Eliminando medalla registrada...`, 'blue');
        await prisma.medal.delete({
          where: { medalString }
        });
        log(`   ✅ Medalla eliminada`, 'green');

        if (userMedals.length === 1) {
          log(`   → Usuario tiene solo 1 medalla. Eliminando usuario...`, 'blue');
          await prisma.user.delete({
            where: { id: registeredMedal.ownerId }
          });
          log(`   ✅ Usuario eliminado`, 'green');
        } else {
          log(`   → Usuario tiene ${userMedals.length} medallas. No se elimina usuario.`, 'blue');
        }
      }

      return { success: true };
    }, {
      timeout: transactionTimeout,
      maxWait: transactionTimeout,
    });

    // Agregar timeout manual
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout después de ${transactionTimeout}ms`));
      }, transactionTimeout);
    });

    const result = await Promise.race([transactionPromise, timeoutPromise]);
    const endTime = Date.now();
    const duration = endTime - startTime;

    log(`\n✅ Reset completado exitosamente!`, 'green');
    log(`   - Duración: ${duration}ms`, 'green');

    return { success: true, duration, result };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    log(`\n❌ Error durante el reset:`, 'red');
    
    if (error.message.includes('Timeout')) {
      log(`   - ⚠️  TIMEOUT: El reset se quedó colgado después de ${transactionTimeout}ms`, 'red');
      log(`   - Esto indica un problema de bloqueo o deadlock en la base de datos`, 'yellow');
      log(`   - Posibles causas:`, 'yellow');
      log(`     * Deadlock entre transacciones`, 'yellow');
      log(`     * Bloqueo de filas por otra transacción`, 'yellow');
      log(`     * Problema de conexión a la base de datos`, 'yellow');
    } else {
      log(`   - Error: ${error.message}`, 'red');
      if (error.code) {
        log(`   - Código: ${error.code}`, 'red');
      }
    }

    log(`   - Duración antes del error: ${duration}ms`);

    return { success: false, duration, error: error.message };
  }
}

async function verifyResetResult(medalString) {
  logSection('✅ Verificando Resultado del Reset');

  const virginMedal = await prisma.virginMedal.findFirst({
    where: { medalString }
  });

  if (!virginMedal) {
    log(`❌ La medalla ya no existe en virgin_medals`, 'red');
    return false;
  }

  if (virginMedal.status === 'VIRGIN') {
    log(`✅ La medalla fue reseteada correctamente a estado VIRGIN`, 'green');
  } else {
    log(`⚠️  La medalla NO está en estado VIRGIN. Estado actual: ${virginMedal.status}`, 'yellow');
  }

  const registeredMedal = await prisma.medal.findFirst({
    where: { medalString }
  });

  if (!registeredMedal) {
    log(`✅ La medalla registrada fue eliminada correctamente`, 'green');
  } else {
    log(`⚠️  La medalla registrada AÚN EXISTE (no fue eliminada)`, 'yellow');
  }

  return virginMedal.status === 'VIRGIN' && !registeredMedal;
}

async function createTestMedal(medalString, status = 'INCOMPLETE') {
  logSection('🔧 Creando Medalla de Prueba');

  // Verificar si ya existe
  const existing = await prisma.virginMedal.findFirst({
    where: { medalString }
  });

  if (existing) {
    log(`⚠️  La medalla ${medalString} ya existe. Actualizando estado...`, 'yellow');
    await prisma.virginMedal.update({
      where: { medalString },
      data: { status }
    });
    log(`✅ Medalla actualizada a estado: ${status}`, 'green');
  } else {
    await prisma.virginMedal.create({
      data: {
        medalString,
        status,
        registerHash: `test-hash-${Date.now()}`
      }
    });
    log(`✅ Medalla de prueba creada: ${medalString}`, 'green');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('❌ Uso: node scripts/test-medal-reset-direct.js <medalString> [userEmail]', 'red');
    log('   Ejemplo: node scripts/test-medal-reset-direct.js TEST123 test@example.com', 'yellow');
    process.exit(1);
  }

  const medalString = args[0];
  const userEmail = args[1] || 'test@example.com';

  logSection('🧪 Test de Reseteo de Medalla (Directo)');
  log(`Medal String: ${medalString}`, 'bright');
  log(`User Email: ${userEmail}`, 'bright');

  try {
    // 1. Verificar estado inicial
    const initialStatus = await checkMedalStatus(medalString);
    
    if (!initialStatus) {
      log('\n⚠️  La medalla no existe. Creando medalla de prueba...', 'yellow');
      await createTestMedal(medalString, 'INCOMPLETE');
      await checkMedalStatus(medalString);
    }

    // 2. Ejecutar el test de reset
    const result = await processMedalResetDirect(medalString, userEmail);

    // 3. Verificar resultado
    if (result.success) {
      await verifyResetResult(medalString);
    }

    // 4. Resumen
    logSection('📋 Resumen del Test');
    if (result.success) {
      log(`✅ Test completado exitosamente`, 'green');
      log(`   - Duración: ${result.duration}ms`);
    } else {
      log(`❌ Test falló`, 'red');
      log(`   - Duración: ${result.duration}ms`);
      log(`   - Error: ${result.error}`, 'red');
    }

  } catch (error) {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
main().catch(console.error);

