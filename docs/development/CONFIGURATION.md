# ⚙️ Configuración Avanzada

Guía completa de todas las variables de entorno y opciones de configuración del sistema.

---

## 📋 Índice

- [Variables de Entorno](#variables-de-entorno)
- [Configuración del Servidor](#configuración-del-servidor)
- [Configuración de Simulación](#configuración-de-simulación)
- [Configuración de Servicios](#configuración-de-servicios)
- [Configuración de Email](#configuración-de-email)
- [Configuración de Producción](#configuración-de-producción)
- [Variables de Debugging](#variables-de-debugging)

---

## Variables de Entorno

### Archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# ========================================
# SERVIDOR
# ========================================
PORT=3000
NODE_ENV=development

# ========================================
# CORS
# ========================================
CORS_ORIGIN=http://localhost:5173

# ========================================
# SIMULACIÓN
# ========================================
SIMULATION_INTERVAL=60000
NUMBER_OF_FLOORS=5
BUILDING_NAME=Edificio Principal

# ========================================
# EMAIL (Opcional)
# ========================================
EMAIL_NOTIFICATIONS_ENABLED=false
EMAILJS_SERVICE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
ALERT_EMAIL_RECIPIENTS=admin@example.com

# ========================================
# DEBUGGING (Opcional)
# ========================================
DEBUG=false
LOG_LEVEL=info
```

---

## Configuración del Servidor

### `PORT`

**Tipo**: `number`  
**Default**: `3000`  
**Rango**: `1024-65535`

Puerto donde el servidor escucha conexiones.

**Ejemplo**:
```env
PORT=8080
```

**Uso**:
```bash
# Desarrollo
npm run dev  # Usa PORT=3000

# Producción
PORT=8080 npm start
```

---

### `NODE_ENV`

**Tipo**: `string`  
**Default**: `development`  
**Valores**: `development`, `production`, `test`

Entorno de ejecución. Afecta logging, error handling y optimizaciones.

**Diferencias por entorno**:

| Feature | Development | Production |
|---------|-------------|------------|
| Stack traces | Completos | Simplificados |
| Logs | Verbosos | Esenciales |
| CORS | Permisivo | Restrictivo |
| Cache | Deshabilitado | Habilitado |

**Ejemplo**:
```env
NODE_ENV=production
```

---

### `CORS_ORIGIN`

**Tipo**: `string`  
**Default**: `http://localhost:5173`

Origen permitido para requests CORS. En desarrollo acepta cualquier origen.

**Configuraciones comunes**:

```env
# Frontend local (Vite)
CORS_ORIGIN=http://localhost:5173

# Frontend local (Create React App)
CORS_ORIGIN=http://localhost:3000

# Múltiples orígenes (separados por coma)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Producción
CORS_ORIGIN=https://smartfloors.example.com

# Permitir todos (NO RECOMENDADO)
CORS_ORIGIN=*
```

**Configuración avanzada** (en `src/app.js`):

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## Configuración de Simulación

### `SIMULATION_INTERVAL`

**Tipo**: `number` (milisegundos)  
**Default**: `60000` (1 minuto)  
**Rango**: `1000-600000` (1 seg - 10 min)

Intervalo de generación de datos de sensores.

**Valores comunes**:

```env
# 30 segundos (demo rápida)
SIMULATION_INTERVAL=30000

# 1 minuto (default)
SIMULATION_INTERVAL=60000

# 5 minutos (simulación lenta)
SIMULATION_INTERVAL=300000
```

**Impacto**:
- ⬇️ Menor intervalo = Más datos/hora, mayor uso de RAM
- ⬆️ Mayor intervalo = Menos datos, predicciones menos frecuentes

**Límite de historial**: Siempre 1440 entradas/piso (24h), independiente del intervalo.

---

### `NUMBER_OF_FLOORS`

**Tipo**: `number`  
**Default**: `5`  
**Rango**: `1-100`

Número de pisos a simular.

**Ejemplos**:

```env
# Edificio pequeño
NUMBER_OF_FLOORS=3

# Edificio grande
NUMBER_OF_FLOORS=50

# Máximo teórico
NUMBER_OF_FLOORS=100
```

**Uso de RAM estimado**:

| Pisos | Historial (24h) | RAM Estimada |
|-------|-----------------|--------------|
| 5 | 7,200 registros | ~5 MB |
| 10 | 14,400 registros | ~10 MB |
| 50 | 72,000 registros | ~50 MB |
| 100 | 144,000 registros | ~100 MB |

---

### `BUILDING_NAME`

**Tipo**: `string`  
**Default**: `Edificio Principal`

Nombre del edificio en mensajes de alerta.

**Ejemplo**:
```env
BUILDING_NAME=Torre Smart Tech
```

**Uso**: Aparece en nombres de piso (`Piso 1 - Torre Smart Tech`), alertas, y exports CSV.

---

## Configuración de Servicios

### Rangos de Simulación

Configurados en `src/services/simulator.services.js`:

```javascript
const DEFAULT_RANGES = {
  temperature: { min: 18, max: 32 },     // °C
  humidity: { min: 30, max: 90 },        // %
  occupancy: { min: 0, max: 100 },       // %
  powerConsumption: { min: 50, max: 250 } // kWh
};
```

**Modificar rangos**:

```javascript
// src/services/simulator.services.js
constructor(config) {
  this.ranges = {
    temperature: { min: 20, max: 28 },  // Rango más estrecho
    humidity: { min: 40, max: 70 },
    occupancy: { min: 10, max: 90 },
    powerConsumption: { min: 100, max: 300 }
  };
}
```

---

### Umbrales de Alertas

Configurados en `src/services/alerts.services.js`:

```javascript
const THRESHOLDS = {
  temperature: {
    critical: 30,    // °C
    warning: 28
  },
  humidity: {
    warning: 80      // %
  },
  powerConsumption: {
    warning: 200     // kWh
  },
  thermalOverload: {
    temperature: 30,
    power: 180
  }
};
```

**Modificar umbrales**:

```javascript
// src/services/alerts.services.js
detectCurrent(floor) {
  // Cambiar umbral de temperatura crítica
  if (floor.temperature > 32) {  // Era 30
    // ...
  }
}
```

---

### Configuración de Predicciones

Parámetros en `src/services/prediction.services.js`:

```javascript
const PREDICTION_CONFIG = {
  historySize: 60,         // Registros para cálculo
  predictionPoints: 6,     // Puntos de predicción
  maWeight: 0.6,           // Peso Moving Average
  lrWeight: 0.4            // Peso Linear Regression
};
```

**Ajustar pesos**:

```javascript
// Mayor énfasis en tendencia lineal
predictMetric(history, metric, minutesAhead) {
  const ma = this.movingAverage(history, metric);
  const lr = this.linearRegression(history, metric);
  
  return (ma * 0.3) + (lr * 0.7);  // 30% MA, 70% LR
}
```

---

## Configuración de Email

### Variables Requeridas

Para habilitar notificaciones por email:

```env
EMAIL_NOTIFICATIONS_ENABLED=true
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_PUBLIC_KEY=user_xyz789
EMAILJS_PRIVATE_KEY=abc123xyz789
ALERT_EMAIL_RECIPIENTS=admin@example.com,ops@example.com
```

### `EMAIL_NOTIFICATIONS_ENABLED`

**Tipo**: `boolean`  
**Default**: `false`

Habilita/deshabilita notificaciones por email.

---

### `EMAILJS_SERVICE_ID`

**Tipo**: `string`  
**Requerido**: Sí (si EMAIL_NOTIFICATIONS_ENABLED=true)

ID del servicio de EmailJS.

**Obtener**:
1. Ir a [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Email Services → Add New Service
3. Copiar Service ID

---

### `EMAILJS_PUBLIC_KEY`

**Tipo**: `string`  
**Requerido**: Sí

Clave pública de EmailJS.

**Obtener**:
1. EmailJS Dashboard → Account → API Keys
2. Copiar Public Key

---

### `EMAILJS_PRIVATE_KEY`

**Tipo**: `string`  
**Requerido**: Sí

Clave privada de EmailJS (para uso en servidor).

**Obtener**:
1. EmailJS Dashboard → Account → API Keys
2. Copiar Private Key

---

### `ALERT_EMAIL_RECIPIENTS`

**Tipo**: `string` (separados por coma)  
**Default**: `admin@example.com`

Lista de destinatarios de alertas por email.

**Ejemplo**:
```env
ALERT_EMAIL_RECIPIENTS=admin@example.com,ops@example.com,alerts@example.com
```

**Routing por severidad** (en código):

```javascript
// src/services/email.services.js
getRecipients(severity) {
  const all = process.env.ALERT_EMAIL_RECIPIENTS.split(',');
  
  switch (severity) {
    case 'critical':
      return all;  // Todos reciben críticas
    case 'warning':
      return all.slice(0, 2);  // Solo primeros 2
    case 'info':
      return [all[0]];  // Solo admin
  }
}
```

---

## Configuración de Producción

### Variables Esenciales

```env
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://smartfloors.example.com
SIMULATION_INTERVAL=60000
NUMBER_OF_FLOORS=20
```

### Optimizaciones de Node.js

```bash
# Aumentar memoria heap
NODE_OPTIONS=--max-old-space-size=4096 npm start

# Habilitar optimizaciones V8
NODE_OPTIONS=--optimize-for-size npm start

# Cluster mode (múltiples procesos)
NODE_ENV=production pm2 start index.js -i max
```

### Variables de Sistema

```bash
# Linux/macOS
export NODE_ENV=production
export PORT=8080

# Windows PowerShell
$env:NODE_ENV="production"
$env:PORT="8080"
```

---

## Variables de Debugging

### `DEBUG`

**Tipo**: `boolean`  
**Default**: `false`

Habilita logs de debugging detallados.

**Uso**:
```env
DEBUG=true
```

**Efecto**:
```javascript
// src/services/simulator.services.js
generateData() {
  const data = /* ... */;
  
  if (process.env.DEBUG === 'true') {
    console.log('[DEBUG] Datos generados:', data);
  }
  
  return data;
}
```

---

### `LOG_LEVEL`

**Tipo**: `string`  
**Default**: `info`  
**Valores**: `error`, `warn`, `info`, `debug`

Nivel de logging (si se implementa logger como Winston).

**Configuración con Winston**:

```javascript
// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
```

**Uso**:
```javascript
const logger = require('./utils/logger');

logger.error('Error crítico', { error });
logger.warn('Advertencia', { data });
logger.info('Información', { info });
logger.debug('Debug', { debug });
```

---

## Perfiles de Configuración

### Desarrollo

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
SIMULATION_INTERVAL=30000
NUMBER_OF_FLOORS=5
DEBUG=true
LOG_LEVEL=debug
EMAIL_NOTIFICATIONS_ENABLED=false
```

**Características**:
- ✅ Simulación rápida (30s)
- ✅ Logs verbosos
- ✅ CORS permisivo
- ❌ Email deshabilitado

---

### Testing

```env
NODE_ENV=test
PORT=3001
CORS_ORIGIN=*
SIMULATION_INTERVAL=5000
NUMBER_OF_FLOORS=3
DEBUG=true
LOG_LEVEL=error
EMAIL_NOTIFICATIONS_ENABLED=false
```

**Características**:
- ✅ Simulación ultra-rápida (5s)
- ✅ Solo logs de error
- ✅ Pocos pisos (rápido)

---

### Producción

```env
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://smartfloors.example.com
SIMULATION_INTERVAL=60000
NUMBER_OF_FLOORS=50
DEBUG=false
LOG_LEVEL=warn
EMAIL_NOTIFICATIONS_ENABLED=true
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_PUBLIC_KEY=user_xyz789
EMAILJS_PRIVATE_KEY=abc123xyz789
ALERT_EMAIL_RECIPIENTS=admin@example.com,ops@example.com
```

**Características**:
- ✅ Simulación estándar (60s)
- ✅ Logs esenciales
- ✅ CORS restrictivo
- ✅ Email habilitado

---

## Validación de Configuración

### Script de Validación

Crea `scripts/validate-config.js`:

```javascript
const requiredVars = [
  'PORT',
  'NODE_ENV',
  'SIMULATION_INTERVAL',
  'NUMBER_OF_FLOORS'
];

const optionalVars = [
  'CORS_ORIGIN',
  'EMAIL_NOTIFICATIONS_ENABLED',
  'DEBUG'
];

function validateConfig() {
  const missing = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Variables requeridas faltantes:');
    missing.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }
  
  console.log('✅ Configuración válida');
  
  // Mostrar configuración
  console.log('\n📋 Configuración actual:');
  [...requiredVars, ...optionalVars].forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ${varName}=${value}`);
    }
  });
}

validateConfig();
```

**Uso**:
```bash
node scripts/validate-config.js
```

---

## Mejores Prácticas

### 1. Nunca Comitear `.env`

```gitignore
# .gitignore
.env
.env.local
.env.production
```

### 2. Usar `.env.example`

Crea `.env.example` con valores de ejemplo:

```env
# Servidor
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Simulación
SIMULATION_INTERVAL=60000
NUMBER_OF_FLOORS=5
BUILDING_NAME=Edificio Principal

# Email (opcional)
EMAIL_NOTIFICATIONS_ENABLED=false
EMAILJS_SERVICE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
ALERT_EMAIL_RECIPIENTS=admin@example.com
```

### 3. Validar Tipos

```javascript
// index.js
const PORT = parseInt(process.env.PORT || 3000);
const INTERVAL = parseInt(process.env.SIMULATION_INTERVAL || 60000);

if (isNaN(PORT) || PORT < 1024 || PORT > 65535) {
  console.error('❌ PORT inválido');
  process.exit(1);
}
```

### 4. Secrets Manager (Producción)

**AWS Secrets Manager**:
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return JSON.parse(data.SecretString);
}

// Uso
const secrets = await getSecret('smartfloors/prod');
process.env.EMAILJS_PRIVATE_KEY = secrets.EMAILJS_PRIVATE_KEY;
```

**Azure Key Vault**:
```javascript
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

const client = new SecretClient(
  'https://smartfloors.vault.azure.net',
  new DefaultAzureCredential()
);

const secret = await client.getSecret('EMAILJS-PRIVATE-KEY');
process.env.EMAILJS_PRIVATE_KEY = secret.value;
```

---

## Troubleshooting

### Problema: Variables no cargadas

**Síntoma**: `process.env.PORT` es `undefined`

**Solución**:
```javascript
// Verificar que dotenv se carga PRIMERO
require('dotenv').config();  // ✅ Antes de todo
const express = require('express');

// No después
const express = require('express');
require('dotenv').config();  // ❌ Tarde
```

### Problema: CORS errors

**Síntoma**: `Access-Control-Allow-Origin` error en browser

**Solución**:
```env
# Verificar origen correcto
CORS_ORIGIN=http://localhost:5173  # ✅ Con protocolo

# No usar
CORS_ORIGIN=localhost:5173  # ❌ Sin http://
```

### Problema: Email no se envía

**Síntoma**: Emails no llegan

**Checklist**:
```env
✅ EMAIL_NOTIFICATIONS_ENABLED=true
✅ EMAILJS_SERVICE_ID configurado
✅ EMAILJS_PUBLIC_KEY configurado
✅ EMAILJS_PRIVATE_KEY configurado
✅ ALERT_EMAIL_RECIPIENTS válidos
```

---

## Recursos Adicionales

- **[Guía de Instalación](../guides/INSTALLATION.md)** - Setup inicial
- **[Email Setup](EMAIL_SETUP.md)** - Configuración EmailJS
- **[Troubleshooting](TROUBLESHOOTING.md)** - Problemas comunes

---

<div align="center">

**¿Problemas de configuración?**  
[Ver Troubleshooting](TROUBLESHOOTING.md)

[⬆ Volver arriba](#️-configuración-avanzada)

</div>
