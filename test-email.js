const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1/email';

// CONFIGURACIÓN: Cambia este email por el tuyo
const TEST_EMAIL = 'tu-email@gmail.com';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function separator() {
  console.log('\n' + '='.repeat(60) + '\n');
}

// Test 1: Verificar estado del servicio
async function testStatus() {
  log('🔍 Test 1: Verificar estado del servicio...', 'cyan');

  try {
    const response = await axios.get(`${API_URL}/status`);
    const { data } = response.data;

    console.log('\nRespuesta:', JSON.stringify(data, null, 2));

    if (!data.configured) {
      log('\n❌ FALLO: Servicio no configurado', 'red');
      log('Solución: Revisar variables en .env:', 'yellow');
      log('  - EMAILJS_SERVICE_ID', 'yellow');
      log('  - EMAILJS_PUBLIC_KEY', 'yellow');
      log('  - EMAILJS_PRIVATE_KEY', 'yellow');
      return false;
    }

    if (!data.enabled) {
      log('\n❌ FALLO: Servicio deshabilitado', 'red');
      log('Solución: Configurar EMAIL_NOTIFICATIONS_ENABLED=true en .env', 'yellow');
      return false;
    }

    if (!data.hasRecipients) {
      log('\n⚠️  ADVERTENCIA: No hay destinatarios configurados', 'yellow');
      log('Agregar en .env: EMAIL_RECIPIENTS_CRITICAL=tu-email@gmail.com', 'yellow');
    }

    log('\n✅ ÉXITO: Servicio listo para enviar emails', 'green');
    log(`   - Emails enviados (último minuto): ${data.emailsSentLastMinute}/${data.maxEmailsPerMinute}`, 'green');
    log(`   - Puede enviar más: ${data.canSendMore}`, 'green');

    return true;
  } catch (error) {
    log('\n❌ ERROR: ' + (error.response?.data?.message || error.message), 'red');
    if (error.code === 'ECONNREFUSED') {
      log('Solución: Asegurar que el servidor está corriendo (npm run dev)', 'yellow');
    }
    return false;
  }
}

// Test 2: Enviar email de prueba
async function testEmail() {
  log('📧 Test 2: Enviar email de prueba...', 'cyan');
  log(`   Destinatario: ${TEST_EMAIL}`, 'cyan');

  try {
    const response = await axios.post(`${API_URL}/test`, {
      email: TEST_EMAIL
    });

    console.log('\nRespuesta:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      log('\n✅ ÉXITO: Email de prueba enviado', 'green');
      log('📬 Revisa tu bandeja de entrada (y carpeta SPAM)', 'green');
    } else {
      log('\n⚠️  ADVERTENCIA: Email no enviado', 'yellow');
      log('Razón: ' + response.data.message, 'yellow');
    }

    return true;
  } catch (error) {
    log('\n❌ ERROR: ' + (error.response?.data?.message || error.message), 'red');
    return false;
  }
}

// Test 3: Enviar alerta crítica
async function testCriticalAlert() {
  log('🚨 Test 3: Enviar alerta CRÍTICA...', 'cyan');

  try {
    const response = await axios.post(`${API_URL}/alert`, {
      floorId: 1,
      severity: 'critical',
      anomalies: [
        {
          type: 'thermal_overload',
          metric: 'Sobrecarga Térmica',
          message: 'Temperatura crítica: 32°C con consumo de 250 kWh',
          recommendation: 'ACCIÓN INMEDIATA: Reducir carga del Piso 1'
        },
        {
          type: 'high_power',
          metric: 'Consumo Energético Alto',
          message: 'Consumo excesivo detectado',
          recommendation: 'Revisar equipos de alto consumo'
        }
      ]
    });

    console.log('\nRespuesta:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      log('\n✅ ÉXITO: Alerta crítica enviada', 'green');
      log('📬 Revisa tu bandeja de entrada', 'green');
    } else {
      log('\n⚠️  ADVERTENCIA: Alerta no enviada', 'yellow');
      log('Razón: ' + response.data.message, 'yellow');
    }

    return true;
  } catch (error) {
    log('\n❌ ERROR: ' + (error.response?.data?.message || error.message), 'red');
    return false;
  }
}

// Test 4: Enviar alerta de WARNING
async function testWarningAlert() {
  log('⚠️  Test 4: Enviar alerta WARNING...', 'cyan');

  try {
    const response = await axios.post(`${API_URL}/alert`, {
      floorId: 2,
      severity: 'warning',
      anomalies: [
        {
          type: 'high_temperature',
          metric: 'Temperatura Alta',
          message: 'Temperatura elevada: 29°C',
          recommendation: 'Monitorear y considerar reducir carga'
        }
      ]
    });

    if (response.data.success) {
      log('\n✅ ÉXITO: Alerta warning enviada', 'green');
    } else {
      log('\n⚠️  ADVERTENCIA: Alerta no enviada', 'yellow');
      log('Razón: ' + response.data.message, 'yellow');
    }

    return true;
  } catch (error) {
    log('\n❌ ERROR: ' + (error.response?.data?.message || error.message), 'red');
    return false;
  }
}

// Test 5: Probar rate limiting
async function testRateLimiting() {
  log('⏱️  Test 5: Probar rate limiting (enviar 6 emails rápido)...', 'cyan');
  log('   Límite configurado: 5 emails/minuto', 'cyan');

  let sent = 0;
  let blocked = 0;

  for (let i = 1; i <= 6; i++) {
    try {
      const response = await axios.post(`${API_URL}/test`, {
        email: TEST_EMAIL
      });

      if (response.data.success && response.data.data?.sent) {
        sent++;
        log(`   Email ${i}: ✅ Enviado`, 'green');
      } else {
        blocked++;
        log(`   Email ${i}: ⚠️  Bloqueado (${response.data.data?.reason || 'rate limit'})`, 'yellow');
      }
    } catch (error) {
      blocked++;
      log(`   Email ${i}: ❌ Error`, 'red');
    }

    // Pequeña pausa
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  log(`\n📊 Resultado:`, 'cyan');
  log(`   Enviados: ${sent}`, sent >= 5 ? 'green' : 'yellow');
  log(`   Bloqueados: ${blocked}`, blocked >= 1 ? 'green' : 'yellow');

  if (blocked >= 1) {
    log('\n✅ ÉXITO: Rate limiting funciona correctamente', 'green');
  } else {
    log('\n⚠️  ADVERTENCIA: Todos los emails se enviaron (rate limit no aplicado)', 'yellow');
  }

  return true;
}

// Test 6: Verificar cooldown
async function testCooldown() {
  log('⏳ Test 6: Verificar cooldown de alertas...', 'cyan');
  log('   Enviando 2 alertas iguales seguidas (cooldown: 15 min)', 'cyan');

  try {
    // Primera alerta
    log('\n   Alerta 1...', 'cyan');
    const response1 = await axios.post(`${API_URL}/alert`, {
      floorId: 3,
      severity: 'critical',
      anomalies: [{
        type: 'thermal_overload',
        metric: 'Test Cooldown',
        message: 'Primera alerta',
        recommendation: 'Test'
      }]
    });

    if (response1.data.success && response1.data.data?.sent) {
      log('   Alerta 1: ✅ Enviada', 'green');
    } else {
      log('   Alerta 1: ⚠️  No enviada', 'yellow');
    }

    // Segunda alerta (debería ser bloqueada por cooldown)
    await new Promise(resolve => setTimeout(resolve, 1000));

    log('\n   Alerta 2 (misma alerta)...', 'cyan');
    const response2 = await axios.post(`${API_URL}/alert`, {
      floorId: 3,
      severity: 'critical',
      anomalies: [{
        type: 'thermal_overload',
        metric: 'Test Cooldown',
        message: 'Segunda alerta (debería bloquearse)',
        recommendation: 'Test'
      }]
    });

    if (response2.data.success && response2.data.data?.sent) {
      log('   Alerta 2: ⚠️  Enviada (cooldown no funcionó)', 'yellow');
    } else {
      log('   Alerta 2: ✅ Bloqueada por cooldown', 'green');
      log('   Razón: ' + response2.data.data?.reason, 'green');
    }

    return true;
  } catch (error) {
    log('\n❌ ERROR: ' + (error.response?.data?.message || error.message), 'red');
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  console.clear();
  separator();
  log('🚀 EMAIL SERVICE - SUITE DE TESTS', 'blue');
  log('   SmartFloors Backend v1.0', 'blue');
  separator();

  // Verificar configuración
  log('⚙️  CONFIGURACIÓN:', 'cyan');
  log(`   Email de prueba: ${TEST_EMAIL}`, 'cyan');
  log(`   API URL: ${API_URL}`, 'cyan');

  if (TEST_EMAIL === 'tu-email@gmail.com') {
    log('\n⚠️  ADVERTENCIA: Cambiar TEST_EMAIL en línea 4 del script', 'yellow');
    log('   Editar: const TEST_EMAIL = \'tu-email-real@gmail.com\';', 'yellow');
    separator();
    return;
  }

  separator();

  // Test 1: Estado
  const statusOk = await testStatus();
  if (!statusOk) {
    log('\n❌ Tests abortados. Resolver problemas de configuración primero.', 'red');
    separator();
    return;
  }

  separator();
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Email de prueba
  await testEmail();

  separator();
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Alerta crítica
  await testCriticalAlert();

  separator();
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 4: Alerta warning
  await testWarningAlert();

  separator();
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 5: Rate limiting
  await testRateLimiting();

  separator();
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 6: Cooldown
  await testCooldown();

  separator();
  log('✅ SUITE DE TESTS COMPLETADA', 'green');
  log('\n📬 Revisa tu bandeja de entrada (y SPAM) para ver los emails recibidos', 'cyan');
  separator();
}

// Ejecutar
runAllTests().catch(error => {
  console.error('\n❌ Error fatal:', error.message);
  process.exit(1);
});
