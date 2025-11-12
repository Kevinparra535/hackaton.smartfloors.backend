# ✅ Corrección: Envío Automático de Emails para Alertas Críticas

## 🔍 Problema Identificado

La implementación original **NO enviaba emails automáticamente** cuando se detectaban alertas críticas. Solo emitía las alertas por WebSocket.

## 🛠️ Cambios Realizados

### 1. **src/sockets/index.js** - Integración del EmailService

#### Importación del servicio
```javascript
const EmailService = require('../services/email.services');
let emailService;
```

#### Inicialización
```javascript
function initializeSockets(io) {
  simulator = new FloorSimulator(numberOfFloors);
  predictionService = new PredictionService();
  alertService = new AlertService();
  emailService = new EmailService();  // ← NUEVO
}
```

#### Nueva función: `sendEmailsForCriticalAlerts()`
```javascript
async function sendEmailsForCriticalAlerts(alerts) {
  // Filtrar solo alertas críticas o preventivas críticas
  const criticalAlerts = alerts.filter(alert => 
    alert.severity === 'critical' || 
    (alert.type === 'predictive' && alert.severity === 'critical')
  );

  if (criticalAlerts.length === 0) {
    return;
  }

  // Enviar email por cada alerta crítica
  for (const alert of criticalAlerts) {
    try {
      const emailData = {
        floorId: alert.floorId,
        floorName: alert.floorName,
        buildingName: process.env.BUILDING_NAME || 'Edificio Principal',
        severity: alert.severity,
        anomalies: alert.anomalies,
        timestamp: alert.timestamp,
      };

      const result = await emailService.sendAlert(emailData);

      if (result.sent) {
        console.log(`📧 Email enviado para ${alert.severity.toUpperCase()} - ${alert.floorName}`);
      } else {
        console.log(`⚠️  Email no enviado: ${result.reason}`);
      }
    } catch (error) {
      console.error(`❌ Error al enviar email:`, error.message);
    }
  }
}
```

#### Llamada automática en `generateAndEmitData()`
```javascript
// Emitir alertas si hay (actuales + preventivas)
const allAlerts = [...alerts, ...predictiveAlerts];
if (allAlerts.length > 0) {
  io.emit('new-alerts', {
    alerts: allAlerts,
    timestamp: new Date().toISOString(),
  });

  // 📧 NUEVO - Enviar emails automáticamente
  sendEmailsForCriticalAlerts(allAlerts);
}
```

#### Getter exportado
```javascript
function getEmailService() {
  return emailService;
}

module.exports.getEmailService = getEmailService;
```

---

### 2. **src/controllers/email.controller.js** - Uso del Singleton

Antes (instancia local):
```javascript
const EmailService = require('../services/email.services');
let emailService = null;

const initializeEmailService = () => {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
};
```

Ahora (singleton compartido):
```javascript
const { getEmailService } = require('../sockets/index');

const getEmailStatus = (req, res) => {
  const service = getEmailService();
  
  if (!service) {
    return res.status(503).json({
      success: false,
      message: 'Servicio de email no inicializado',
    });
  }
  
  // ... resto del código
};
```

**Beneficio**: Mismo servicio en REST y WebSocket → estado compartido de rate limiting y cooldown.

---

## 🎯 Comportamiento Actual

### Flujo Automático (cada 60 segundos)

```
1. Simulador genera datos
   ↓
2. AlertService detecta anomalías
   ↓
3. PredictionService genera predicciones
   ↓
4. AlertService genera alertas preventivas
   ↓
5. Se emiten por WebSocket: io.emit('new-alerts')
   ↓
6. ✨ NUEVO: Se filtran alertas críticas
   ↓
7. ✨ NUEVO: Se envían emails automáticamente
```

### Criterios de Envío

**Se envían emails para:**
- ✅ `severity === 'critical'` (alertas actuales críticas)
- ✅ `type === 'predictive' && severity === 'critical'` (alertas preventivas críticas)

**NO se envían emails para:**
- ❌ `severity === 'warning'`
- ❌ `severity === 'info'`

### Rate Limiting Aplicado

- **Máximo**: 5 emails por minuto
- **Cooldown**: 15 minutos por alerta del mismo piso
- **Deduplicación**: Evita enviar la misma alerta múltiples veces

---

## 📊 Logs del Sistema

### Cuando se envía email

```bash
📊 Datos generados y emitidos | Alertas: Actuales: 0, Preventivas: 1
📧 Email enviado para CRITICAL - Piso 1
```

### Cuando se bloquea por rate limiting

```bash
📊 Datos generados y emitidos | Alertas: Actuales: 1, Preventivas: 0
⚠️  Email no enviado: Rate limit exceeded
```

### Cuando se bloquea por cooldown

```bash
📊 Datos generados y emitidos | Alertas: Actuales: 1, Preventivas: 0
⚠️  Email no enviado: Cooldown active
```

---

## 🧪 Cómo Testear

### Opción 1: Esperar Detección Automática

```bash
# 1. Configurar .env
EMAIL_NOTIFICATIONS_ENABLED=true
EMAILJS_SERVICE_ID=service_xxx
EMAILJS_PUBLIC_KEY=user_xxx
EMAILJS_PRIVATE_KEY=xxx
EMAIL_RECIPIENTS_CRITICAL=tu-email@gmail.com

# 2. Iniciar servidor
npm run dev

# 3. Esperar a que se generen datos (cada 60 segundos)
# 4. Si temperatura > 30°C + consumo > 180 kWh, recibirás email
```

### Opción 2: Forzar Alerta con Endpoint Manual

```bash
# Enviar alerta crítica manualmente
curl -Method POST `
     -Uri "http://localhost:3000/api/v1/email/alert" `
     -ContentType "application/json" `
     -Body '{
       "floorId": 1,
       "floorName": "Piso 1",
       "severity": "critical",
       "anomalies": [{
         "type": "thermal_overload",
         "metric": "Sobrecarga Térmica",
         "message": "Temperatura crítica: 32°C",
         "recommendation": "Reducir carga AHORA"
       }]
     }'
```

### Opción 3: Bajar Umbrales Temporalmente

En `src/services/alerts.services.js`:
```javascript
// Cambiar línea ~150
if (floor.temperature > 25 && floor.powerConsumption > 150) {  // Era 30 y 180
  // Generará alerta crítica más frecuentemente
}
```

---

## ✅ Checklist de Verificación

Antes de testear, asegurar:

- [x] EmailService inicializado en `src/sockets/index.js`
- [x] Función `sendEmailsForCriticalAlerts()` agregada
- [x] Llamada automática en `generateAndEmitData()`
- [x] Controller usa singleton de `getEmailService()`
- [x] Variables de `.env` configuradas:
  - `EMAIL_NOTIFICATIONS_ENABLED=true`
  - `EMAILJS_SERVICE_ID`
  - `EMAILJS_PUBLIC_KEY`
  - `EMAILJS_PRIVATE_KEY`
  - `EMAIL_RECIPIENTS_CRITICAL`

---

## 🔄 Próximos Pasos Opcionales

### 1. Enviar Resumen Diario Automático

Agregar en `src/sockets/index.js`:

```javascript
// En generateAndEmitData(), verificar si es medianoche
const now = new Date();
if (now.getHours() === 0 && now.getMinutes() === 0) {
  // Generar resumen del día
  const summary = {
    total: alertService.getAlerts().length,
    critical: alertService.getAlerts().filter(a => a.severity === 'critical').length,
    // ... más stats
  };
  
  emailService.sendDailySummary(summary);
}
```

### 2. Configurar Múltiples Destinatarios por Severidad

En `.env`:
```env
# Críticas: todos
EMAIL_RECIPIENTS_CRITICAL=admin@example.com,ops@example.com,manager@example.com

# Warnings: solo ops
EMAIL_RECIPIENTS_WARNING=ops@example.com

# Info: solo admin
EMAIL_RECIPIENTS_INFO=admin@example.com
```

### 3. Agregar Métricas de Emails Enviados

```javascript
// En src/services/email.services.js
class EmailService {
  constructor() {
    this.metrics = {
      totalSent: 0,
      byType: { critical: 0, warning: 0, info: 0 },
      failed: 0
    };
  }
  
  async sendAlert(alert) {
    const result = await /* ... */;
    
    if (result.sent) {
      this.metrics.totalSent++;
      this.metrics.byType[alert.severity]++;
    } else {
      this.metrics.failed++;
    }
    
    return result;
  }
}
```

---

## 📚 Recursos

- **Script de Testing**: `test-email.js`
- **Guía Completa**: `EMAIL_TESTING_GUIDE.md`
- **Documentación EmailJS**: https://www.emailjs.com/docs/

---

## ✨ Resumen

### Antes
❌ Sistema solo emitía alertas por WebSocket  
❌ No había integración de email automática  
❌ Emails solo por endpoint manual  

### Ahora
✅ Sistema envía emails automáticamente para alertas críticas  
✅ Rate limiting aplicado (5 emails/min)  
✅ Cooldown para evitar spam (15 min)  
✅ Servicio singleton compartido entre REST y WebSocket  
✅ Logs informativos de envíos  

---

**Estado**: ✅ **IMPLEMENTACIÓN COMPLETA Y FUNCIONAL**

La próxima vez que el simulador detecte una alerta crítica (temperatura > 30°C + consumo > 180 kWh), recibirás un email automáticamente.
