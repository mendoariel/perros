/**
 * Script de prueba para el reseteo de medalla
 * 
 * Este script prueba la funcionalidad de reseteo de medalla para identificar
 * posibles problemas de timeout o bloqueos.
 * 
 * Uso:
 *   node scripts/test-medal-reset.js <medalString> [userEmail]
 * 
 * Ejemplo:
 *   node scripts/test-medal-reset.js TEST123 test@example.com
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

// Configuración
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3333';
const API_ENDPOINT = `${BACKEND_URL}/qr/process-reset`;

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

async function testMedalReset(medalString, userEmail = 'test@example.com') {
  logSection('🔄 Probando Reset de Medalla');

  const startTime = Date.now();
  const timeout = 30000; // 30 segundos de timeout

  try {
    log(`📤 Enviando request a: ${API_ENDPOINT}`, 'blue');
    log(`   - Medal String: ${medalString}`);
    log(`   - User Email: ${userEmail}`);

    const requestPromise = axios.post(API_ENDPOINT, {
      medalString,
      userEmail
    }, {
      timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Agregar timeout manual
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout después de ${timeout}ms`));
      }, timeout);
    });

    const response = await Promise.race([requestPromise, timeoutPromise]);
    const endTime = Date.now();
    const duration = endTime - startTime;

    log(`\n✅ Reset completado exitosamente!`, 'green');
    log(`   - Duración: ${duration}ms`);
    log(`   - Response:`, 'green');
    console.log(JSON.stringify(response.data, null, 2));

    return { success: true, duration, response: response.data };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    log(`\n❌ Error durante el reset:`, 'red');
    
    if (error.code === 'ECONNREFUSED') {
      log(`   - El backend no está disponible en ${BACKEND_URL}`, 'red');
      log(`   - Asegúrate de que el backend esté corriendo`, 'yellow');
    } else if (error.message.includes('Timeout')) {
      log(`   - ⚠️  TIMEOUT: El reset se quedó colgado después de ${timeout}ms`, 'red');
      log(`   - Esto indica un problema de bloqueo o deadlock`, 'yellow');
    } else if (error.response) {
      log(`   - Status: ${error.response.status}`, 'red');
      log(`   - Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    } else {
      log(`   - Error: ${error.message}`, 'red');
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

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('❌ Uso: node scripts/test-medal-reset.js <medalString> [userEmail]', 'red');
    log('   Ejemplo: node scripts/test-medal-reset.js TEST123 test@example.com', 'yellow');
    process.exit(1);
  }

  const medalString = args[0];
  const userEmail = args[1] || 'test@example.com';

  logSection('🧪 Test de Reseteo de Medalla');
  log(`Medal String: ${medalString}`, 'bright');
  log(`User Email: ${userEmail}`, 'bright');
  log(`Backend URL: ${BACKEND_URL}`, 'bright');

  try {
    // 1. Verificar estado inicial
    const initialStatus = await checkMedalStatus(medalString);
    
    if (!initialStatus) {
      log('\n⚠️  La medalla no existe. ¿Deseas crearla? (y/n)', 'yellow');
      // Por ahora, la creamos automáticamente para testing
      await createTestMedal(medalString, 'INCOMPLETE');
      await checkMedalStatus(medalString);
    }

    // 2. Verificar que el estado permite reset
    const virginMedal = await prisma.virginMedal.findFirst({
      where: { medalString }
    });

    const allowedStates = ['REGISTER_PROCESS', 'PENDING_CONFIRMATION', 'INCOMPLETE'];
    if (!allowedStates.includes(virginMedal.status)) {
      log(`\n⚠️  ADVERTENCIA: El estado actual (${virginMedal.status}) NO está en la lista de estados permitidos para reset.`, 'yellow');
      log(`   Estados permitidos: ${allowedStates.join(', ')}`, 'yellow');
      log(`   Esto puede causar que el reset falle.`, 'yellow');
    }

    // 3. Ejecutar el test de reset
    const result = await testMedalReset(medalString, userEmail);

    // 4. Verificar resultado
    if (result.success) {
      await verifyResetResult(medalString);
    }

    // 5. Resumen
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

