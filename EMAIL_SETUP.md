# 📧 Configuración de EmailJS - SmartFloors Backend

Guía completa para implementar notificaciones por email usando EmailJS en el sistema SmartFloors.

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Configuración de EmailJS](#configuración-de-emailjs)
4. [Instalación](#instalación)
5. [Configuración del Proyecto](#configuración-del-proyecto)
6. [Creación de Plantillas](#creación-de-plantillas)
7. [Implementación](#implementación)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

EmailJS es un servicio que permite enviar emails directamente desde JavaScript sin necesidad de un servidor backend adicional. En SmartFloors, lo utilizamos para enviar notificaciones de alertas críticas, warnings e informativas.

**Características implementadas**:
- ✅ Envío de alertas por email según severidad
- ✅ Rate limiting (máximo 5 emails/minuto)
- ✅ Cooldown para evitar spam (15 minutos por alerta)
- ✅ Múltiples destinatarios según tipo de alerta
- ✅ Plantillas personalizadas para cada severidad
- ✅ Resumen diario de alertas
- ✅ Email de prueba para validar configuración

---

## 📦 Requisitos Previos

- Cuenta en [EmailJS](https://www.emailjs.com/)
- Node.js v16+ instalado
- Proyecto SmartFloors Backend configurado
- Cuenta de email (Gmail, Outlook, SendGrid, etc.)

---

## 🔧 Configuración de EmailJS

### Paso 1: Crear cuenta en EmailJS

1. Ir a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click en "Sign Up" y crear una cuenta
3. Verificar email

### Paso 2: Agregar servicio de email

1. En el dashboard, ir a **"Email Services"**
2. Click en **"Add New Service"**
3. Seleccionar proveedor (Gmail, Outlook, etc.)
4. Seguir instrucciones específicas del proveedor:

**Para Gmail**:
```
- Service: Gmail
- Email: tu-email@gmail.com
- Name: SmartFloors Notifications
```

5. **Importante**: Si usas Gmail, habilitar "2-Step Verification" y generar una "App Password":
   - Ir a: https://myaccount.google.com/security
   - "2-Step Verification" → Activar
   - "App passwords" → Generar para "Mail"
   - Usar esta contraseña en EmailJS

6. Guardar y copiar el **Service ID** (ej: `service_abc123`)

### Paso 3: Obtener credenciales

1. En el dashboard, ir a **"Account"** → **"General"**
2. Copiar:
   - **Public Key** (User ID)
   - **Private Key** (en "API Keys")

---

## 💻 Instalación

### 1. Instalar dependencia de EmailJS

```bash
npm install @emailjs/nodejs
```

### 2. Descomentar imports en el código

En `src/services/email.services.js`, descomentar:

```javascript
// Línea 18 - Descomentar:
const emailjs = require('@emailjs/nodejs');
```

---

## ⚙️ Configuración del Proyecto

### 1. Variables de Entorno

Editar `.env` con tus credenciales:

```env
# Habilitar notificaciones por email
EMAIL_NOTIFICATIONS_ENABLED=true

# Credenciales de EmailJS (obtener en dashboard)
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_PUBLIC_KEY=tu_public_key_aqui
EMAILJS_PRIVATE_KEY=tu_private_key_aqui

# IDs de plantillas (crear en siguiente paso)
EMAILJS_TEMPLATE_CRITICAL=template_critical_smartfloors
EMAILJS_TEMPLATE_WARNING=template_warning_smartfloors
EMAILJS_TEMPLATE_INFO=template_info_smartfloors
EMAILJS_TEMPLATE_SUMMARY=template_summary_smartfloors

# Destinatarios de emails (separados por comas, sin espacios)
EMAIL_RECIPIENTS_CRITICAL=admin@empresa.com,manager@empresa.com
EMAIL_RECIPIENTS_WARNING=admin@empresa.com,supervisor@empresa.com
EMAIL_RECIPIENTS_INFO=notifications@empresa.com
EMAIL_RECIPIENTS_ADMIN=admin@empresa.com

# Rate limiting
EMAIL_MAX_PER_MINUTE=5
EMAIL_COOLDOWN_MINUTES=15
```

### 2. Verificar configuración

Verificar que `.env.example` tenga todas las variables (ya incluido en el código).

---

## 📝 Creación de Plantillas

### Plantilla 1: Alerta Crítica

1. En EmailJS dashboard, ir a **"Email Templates"**
2. Click en **"Create New Template"**
3. Configurar:

**Template ID**: `template_critical_smartfloors`

**Subject**: `🚨 ALERTA CRÍTICA - {{floor_name}} | SmartFloors`

**Body (HTML)**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: {{severity_color}}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .anomaly { background-color: white; margin: 10px 0; padding: 15px; border-left: 4px solid {{severity_color}}; }
        .recommendation { background-color: #fff3cd; padding: 10px; margin-top: 10px; border-radius: 3px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{severity_icon}} ALERTA {{severity}}</h1>
            <h2>{{building_name}} - {{floor_name}}</h2>
        </div>
        
        <div class="content">
            <p><strong>Fecha y hora:</strong> {{timestamp}}</p>
            <p><strong>Número de anomalías:</strong> {{anomalies_count}}</p>
            
            <h3>Detalle de Anomalías:</h3>
            <div style="white-space: pre-line;">{{anomalies_list}}</div>
            
            <div class="recommendation">
                <strong>⚡ Acción Inmediata Requerida:</strong>
                <p>{{main_recommendation}}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>SmartFloors - Sistema de Monitoreo Inteligente de Edificios</p>
            <p>Este es un mensaje automático. No responder a este email.</p>
        </div>
    </div>
</body>
</html>
```

4. Click en **"Save"**

### Plantilla 2: Warning

Repetir el proceso con:
- **Template ID**: `template_warning_smartfloors`
- **Subject**: `⚠️ ADVERTENCIA - {{floor_name}} | SmartFloors`
- Usar el mismo HTML pero cambiar colores a amarillo (#F59E0B)

### Plantilla 3: Info

- **Template ID**: `template_info_smartfloors`
- **Subject**: `ℹ️ INFORMACIÓN - {{floor_name}} | SmartFloors`
- Color azul (#3B82F6)

### Plantilla 4: Resumen Diario

- **Template ID**: `template_summary_smartfloors`
- **Subject**: `📊 Resumen Diario - SmartFloors {{date}}`
- Crear estructura para resumen (ver ejemplo en código)

---

## 🔨 Implementación

### Paso 1: Implementar método sendAlert()

En `src/services/email.services.js`, línea ~137, descomentar y completar:

```javascript
async sendAlert(alert) {
  try {
    // Verificaciones ya implementadas...
    
    // Preparar parámetros (ya implementado)
    const templateParams = { ... };
    
    // IMPLEMENTAR AQUÍ:
    const response = await emailjs.send(
      this.serviceId,
      templateId,
      {
        ...templateParams,
        to_email: recipients.join(','),
      },
      {
        publicKey: this.publicKey,
        privateKey: this.privateKey,
      }
    );

    // Registrar envío
    this.emailsSent.push(Date.now());
    this.lastAlertSent.set(`${alert.floorId}-${alert.severity}`, Date.now());

    console.log(`✅ Email enviado: ${alert.severity} - Piso ${alert.floorId}`);
    return {
      sent: true,
      recipients: recipients.length,
      messageId: response.text,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('❌ Error al enviar email:', error.message);
    return {
      sent: false,
      error: error.message,
    };
  }
}
```

### Paso 2: Implementar sendTestEmail()

En el mismo archivo, línea ~234:

```javascript
async sendTestEmail(email) {
  try {
    const configStatus = this.checkConfiguration();
    if (!configStatus.configured) {
      throw new Error(`Configuración incompleta: ${configStatus.missingConfig.join(', ')}`);
    }

    const templateParams = {
      to_email: email,
      message: 'Este es un email de prueba del sistema SmartFloors',
      timestamp: new Date().toLocaleString('es-ES'),
      building_name: process.env.BUILDING_NAME || 'SmartFloors',
    };

    const response = await emailjs.send(
      this.serviceId,
      this.templates.info, // Usar plantilla de info para pruebas
      templateParams,
      {
        publicKey: this.publicKey,
        privateKey: this.privateKey,
      }
    );

    console.log(`✅ Email de prueba enviado a: ${email}`);
    return {
      sent: true,
      messageId: response.text,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('❌ Error al enviar email de prueba:', error.message);
    return {
      sent: false,
      error: error.message,
    };
  }
}
```

### Paso 3: Implementar sendDailySummary()

Similar a los anteriores, usar la plantilla `summary`.

### Paso 4: Descomentar en controlador

En `src/controllers/email.controller.js`, descomentar las líneas que llaman a los métodos del servicio (marcadas con TODO).

---

## 🧪 Testing

### 1. Verificar estado del servicio

```bash
curl http://localhost:3000/api/v1/email/status | jq '.'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "configured": true,
    "enabled": true,
    "missingConfig": [],
    "hasRecipients": true,
    "stats": {
      "emailsSentLastMinute": 0,
      "maxEmailsPerMinute": 5,
      "canSendMore": true
    }
  }
}
```

### 2. Enviar email de prueba

```bash
curl -X POST http://localhost:3000/api/v1/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "tu-email@gmail.com"}'
```

### 3. Enviar alerta de prueba

```bash
curl -X POST http://localhost:3000/api/v1/email/alert \
  -H "Content-Type: application/json" \
  -d '{
    "alert": {
      "floorId": 3,
      "floorName": "Piso 3",
      "buildingName": "Edificio Principal",
      "severity": "critical",
      "anomalies": [
        {
          "type": "occupancy",
          "severity": "critical",
          "metric": "Ocupación",
          "value": 98,
          "message": "Ocupación crítica: 98 personas",
          "recommendation": "Activar ventilación adicional y redistribuir personas",
          "timestamp": "2025-11-11T22:00:00Z"
        }
      ],
      "timestamp": "2025-11-11T22:00:00Z"
    }
  }'
```

### 4. Verificar límites

Enviar 6 emails seguidos para probar rate limiting:

```bash
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/v1/email/test \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com"}'
  echo "\nEmail $i enviado"
  sleep 1
done
```

El 6to debería fallar con rate limit.

---

## 🔍 Troubleshooting

### Error: "Configuración incompleta"

**Problema**: Faltan variables de entorno.

**Solución**:
```bash
# Verificar .env
cat .env | grep EMAILJS

# Deben aparecer todas las variables
```

### Error: "Authentication failed"

**Problema**: Credenciales incorrectas.

**Solución**:
1. Verificar Service ID en EmailJS dashboard
2. Regenerar Private Key si es necesario
3. Si usas Gmail, verificar App Password

### Emails no llegan

**Problema**: Pueden estar en spam o bloqueados.

**Solución**:
1. Revisar carpeta de spam
2. Agregar remitente a contactos
3. Verificar logs de EmailJS dashboard
4. Verificar límites de envío de EmailJS (200/mes gratis)

### Rate limit muy estricto

**Problema**: No permite enviar suficientes emails.

**Solución**:
```env
# Aumentar en .env
EMAIL_MAX_PER_MINUTE=10
EMAIL_COOLDOWN_MINUTES=5
```

### Cooldown no se limpia

**Solución**:
```bash
# Endpoint para limpiar cooldowns
curl -X POST http://localhost:3000/api/v1/email/clear-cooldowns
```

---

## 📊 Integración con Alertas Automáticas

Para enviar emails automáticamente cuando se detecten alertas:

### Opción 1: Modificar sockets/index.js

```javascript
// En generateAndEmitData(), después de detectar alertas:

const EmailService = require('../services/email.services');
const emailService = new EmailService();

alerts.forEach(async (alert) => {
  if (alert.severity === 'critical' || alert.severity === 'warning') {
    const result = await emailService.sendAlert(alert);
    if (result.sent) {
      console.log(`📧 Email enviado para alerta ${alert.severity}`);
    }
  }
});
```

### Opción 2: Crear tarea programada (cron)

```javascript
// Usando node-cron
const cron = require('node-cron');

// Enviar resumen diario a las 8:00 AM
cron.schedule('0 8 * * *', async () => {
  const summary = generateDailySummary();
  await emailService.sendDailySummary(summary);
});
```

---

## 📚 Recursos

- [Documentación EmailJS](https://www.emailjs.com/docs/)
- [API Reference](https://www.emailjs.com/docs/rest-api/send/)
- [Plantillas HTML](https://www.emailjs.com/docs/user-guide/creating-email-template/)
- [Límites de cuenta](https://www.emailjs.com/docs/user-guide/pricing/)

---

## ✅ Checklist de Implementación

- [ ] Cuenta EmailJS creada
- [ ] Servicio de email configurado
- [ ] Plantillas creadas (critical, warning, info, summary)
- [ ] Variables de entorno configuradas
- [ ] `npm install @emailjs/nodejs` ejecutado
- [ ] Imports descomentados en email.services.js
- [ ] Método sendAlert() implementado
- [ ] Método sendTestEmail() implementado
- [ ] Método sendDailySummary() implementado
- [ ] Controllers descomentados
- [ ] Rutas agregadas a index.js
- [ ] Email de prueba enviado exitosamente
- [ ] Rate limiting validado
- [ ] Cooldowns validados
- [ ] Integración con alertas automáticas (opcional)

---

## 🎉 Conclusión

Una vez completados todos los pasos, el sistema SmartFloors estará enviando notificaciones por email automáticamente cuando se detecten anomalías críticas o advertencias en los pisos monitoreados.

Para soporte adicional, consultar los comentarios TODO en el código o la documentación de EmailJS.
