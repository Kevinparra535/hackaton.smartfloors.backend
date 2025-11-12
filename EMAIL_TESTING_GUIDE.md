# 🧪 Guía de Testing - Email Service

## Métodos de Testing

### 1️⃣ Testing con Postman (RECOMENDADO)

**Paso 1: Configurar .env**
```env
# Habilitar email
EMAIL_NOTIFICATIONS_ENABLED=true

# Credenciales de EmailJS (obtener de https://dashboard.emailjs.com/)
EMAILJS_SERVICE_ID=service_xxx
EMAILJS_PUBLIC_KEY=user_xxx
EMAILJS_PRIVATE_KEY=xxx

# Destinatarios (tu email para testing)
EMAIL_RECIPIENTS_CRITICAL=tu-email@gmail.com
EMAIL_RECIPIENTS_WARNING=tu-email@gmail.com
EMAIL_RECIPIENTS_INFO=tu-email@gmail.com
EMAIL_RECIPIENTS_ADMIN=tu-email@gmail.com
```

**Paso 2: Reiniciar servidor**
```powershell
npm run dev
```

**Paso 3: Usar Postman**

#### A. Test de Configuración
```http
GET http://localhost:3000/api/v1/email/status
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "configured": true,
    "emailsSentLastMinute": 0,
    "maxEmailsPerMinute": 5,
    "canSendMore": true
  }
}
```

#### B. Enviar Email de Prueba
```http
POST http://localhost:3000/api/v1/email/test
Content-Type: application/json

{
  "email": "tu-email@gmail.com"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "sent": true,
    "recipient": "tu-email@gmail.com",
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

#### C. Enviar Alerta Manual
```http
POST http://localhost:3000/api/v1/email/alert
Content-Type: application/json

{
  "floorId": 1,
  "severity": "critical",
  "anomalies": [
    {
      "type": "thermal_overload",
      "metric": "Sobrecarga Térmica",
      "message": "Temperatura crítica: 32°C con consumo alto",
      "recommendation": "Reducir carga inmediatamente"
    }
  ]
}
```

---

### 2️⃣ Testing con cURL (PowerShell)

#### A. Verificar Estado
```powershell
curl http://localhost:3000/api/v1/email/status
```

#### B. Enviar Email de Prueba
```powershell
$body = @{
    email = "tu-email@gmail.com"
} | ConvertTo-Json

curl -Method POST `
     -Uri "http://localhost:3000/api/v1/email/test" `
     -ContentType "application/json" `
     -Body $body
```

#### C. Enviar Alerta
```powershell
$alert = @{
    floorId = 1
    severity = "critical"
    anomalies = @(
        @{
            type = "thermal_overload"
            metric = "Sobrecarga Térmica"
            message = "Temperatura crítica detectada"
            recommendation = "Reducir carga AHORA"
        }
    )
} | ConvertTo-Json -Depth 3

curl -Method POST `
     -Uri "http://localhost:3000/api/v1/email/alert" `
     -ContentType "application/json" `
     -Body $alert
```

---

### 3️⃣ Testing con Script Node.js

Crea `test-email.js`:

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1/email';

// Test 1: Verificar estado
async function testStatus() {
  console.log('🔍 Test 1: Verificar estado del servicio...\n');
  
  try {
    const response = await axios.get(`${API_URL}/status`);
    console.log('✅ Estado:', JSON.stringify(response.data, null, 2));
    
    if (!response.data.data.configured) {
      console.error('❌ Servicio no configurado. Revisar .env');
      return false;
    }
    
    if (!response.data.data.enabled) {
      console.error('❌ Servicio deshabilitado. Configurar EMAIL_NOTIFICATIONS_ENABLED=true');
      return false;
    }
    
    console.log('✅ Servicio listo para enviar emails\n');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Test 2: Enviar email de prueba
async function testEmail() {
  console.log('📧 Test 2: Enviar email de prueba...\n');
  
  try {
    const response = await axios.post(`${API_URL}/test`, {
      email: 'tu-email@gmail.com' // CAMBIAR AQUÍ
    });
    
    console.log('✅ Email enviado:', JSON.stringify(response.data, null, 2));
    console.log('📬 Revisa tu bandeja de entrada\n');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Enviar alerta crítica
async function testCriticalAlert() {
  console.log('🚨 Test 3: Enviar alerta crítica...\n');
  
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
        }
      ]
    });
    
    console.log('✅ Alerta enviada:', JSON.stringify(response.data, null, 2));
    console.log('📬 Revisa tu bandeja de entrada\n');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Rate Limiting
async function testRateLimiting() {
  console.log('⏱️  Test 4: Probar rate limiting (enviar 6 emails)...\n');
  
  for (let i = 1; i <= 6; i++) {
    try {
      const response = await axios.post(`${API_URL}/test`, {
        email: 'tu-email@gmail.com' // CAMBIAR AQUÍ
      });
      
      if (response.data.success) {
        console.log(`✅ Email ${i}: Enviado`);
      } else {
        console.log(`⚠️  Email ${i}: ${response.data.message || 'No enviado'}`);
      }
    } catch (error) {
      console.log(`❌ Email ${i}: Error -`, error.response?.data?.message || error.message);
    }
    
    // Esperar 500ms entre envíos
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n💡 Nota: El límite es 5 emails/minuto. El 6to debería fallar.\n');
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log('🚀 Iniciando tests del Email Service\n');
  console.log('='.repeat(50) + '\n');
  
  const configured = await testStatus();
  if (!configured) {
    console.log('\n❌ Tests abortados. Configurar servicio primero.\n');
    return;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testEmail();
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  await testCriticalAlert();
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  await testRateLimiting();
  
  console.log('='.repeat(50));
  console.log('✅ Tests completados\n');
}

// Ejecutar
runAllTests().catch(console.error);
```

**Ejecutar:**
```powershell
node test-email.js
```

---

### 4️⃣ Testing Automático con Alertas Reales

El sistema envía emails automáticamente cuando detecta anomalías. Para forzar una alerta:

**Opción A: Esperar detección automática**
- El simulador genera datos cada 60 segundos
- Si detecta temperatura > 30°C + consumo > 180 kWh, envía email

**Opción B: Modificar umbrales temporalmente**

En `src/services/alerts.services.js`:
```javascript
// Bajar umbrales para testing
detectCurrent(floor) {
  const anomalies = [];
  
  // Cambiar temporalmente 30 a 25 para forzar alertas
  if (floor.temperature > 25 && floor.powerConsumption > 150) {
    anomalies.push({
      type: 'thermal_overload',
      severity: 'critical',
      // ...
    });
  }
  
  return anomalies;
}
```

---

## 🔍 Verificación de Resultados

### Checklist de Email Recibido

El email debe contener:
- ✅ Asunto con severidad (CRITICAL, WARNING, INFO)
- ✅ Nombre del edificio
- ✅ Piso afectado
- ✅ Timestamp en español
- ✅ Lista de anomalías
- ✅ Recomendaciones
- ✅ Colores según severidad

### Logs del Servidor

Busca en consola:
```
📤 Enviando email: CRITICAL - Piso 1
   Destinatarios: tu-email@gmail.com
✅ Emails enviados: 1/1
```

### Errores Comunes

#### ❌ "Service not configured"
**Solución**: Revisar variables en `.env`
```env
EMAILJS_SERVICE_ID=service_xxx
EMAILJS_PUBLIC_KEY=user_xxx
EMAILJS_PRIVATE_KEY=xxx
```

#### ❌ "Rate limit exceeded"
**Solución**: Esperar 1 minuto o aumentar límite
```env
EMAIL_MAX_PER_MINUTE=10
```

#### ❌ "No recipients configured"
**Solución**: Agregar destinatarios en `.env`
```env
EMAIL_RECIPIENTS_CRITICAL=tu-email@gmail.com
```

#### ❌ Email no llega
**Checklist**:
1. ✅ Revisar carpeta de SPAM
2. ✅ Verificar email correcto en destinatarios
3. ✅ Revisar logs del servidor (errores de EmailJS)
4. ✅ Verificar plantilla existe en EmailJS dashboard

---

## 📊 Monitoreo en Tiempo Real

### Endpoint de Estadísticas
```http
GET http://localhost:3000/api/v1/email/status
```

Muestra:
- Emails enviados en último minuto
- Límite de rate limiting
- Si puede enviar más
- Número de destinatarios configurados

---

## 🎯 Plan de Testing Recomendado

### Día 1: Setup y Test Básico
1. ✅ Configurar EmailJS
2. ✅ Agregar variables a `.env`
3. ✅ Reiniciar servidor
4. ✅ Verificar status endpoint
5. ✅ Enviar email de prueba

### Día 2: Tests Funcionales
1. ✅ Enviar alerta CRITICAL
2. ✅ Enviar alerta WARNING
3. ✅ Enviar alerta INFO
4. ✅ Verificar rate limiting
5. ✅ Verificar cooldown

### Día 3: Integración
1. ✅ Probar alertas automáticas
2. ✅ Verificar múltiples destinatarios
3. ✅ Probar resumen diario
4. ✅ Testing de producción

---

## 🚀 Quick Start Testing

**1 comando para testear todo:**

```powershell
# 1. Asegurar que servidor está corriendo
npm run dev

# 2. En otra terminal, testear
curl http://localhost:3000/api/v1/email/status

# 3. Si respuesta es OK, enviar test
curl -Method POST `
     -Uri "http://localhost:3000/api/v1/email/test" `
     -ContentType "application/json" `
     -Body '{"email":"tu-email@gmail.com"}'
```

---

## 📚 Recursos Adicionales

- **EmailJS Dashboard**: https://dashboard.emailjs.com/
- **Documentación EmailJS**: https://www.emailjs.com/docs/
- **Colección Postman**: `postman/SmartFloors.postman_collection.json`

---

¿Necesitas ayuda con algún paso específico? 🤔
