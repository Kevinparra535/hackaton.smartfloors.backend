# 🏗️ Arquitectura del Sistema

Documentación técnica de la arquitectura interna de SmartFloors Backend.

---

## 📋 Índice

- [Visión General](#visión-general)
- [Patrones de Diseño](#patrones-de-diseño)
- [Componentes Principales](#componentes-principales)
- [Flujo de Datos](#flujo-de-datos)
- [Gestión de Estado](#gestión-de-estado)
- [Estrategia de Simulación](#estrategia-de-simulación)
- [Sistema de Alertas](#sistema-de-alertas)
- [Predicciones ML](#predicciones-ml)
- [Escalabilidad](#escalabilidad)

---

## Visión General

SmartFloors Backend es una aplicación **Node.js** que simula un sistema de monitoreo IoT en tiempo real para edificios inteligentes.

### Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTES                              │
│  (Navegadores, Apps Móviles, Dashboards, Scripts)           │
└───────────────────┬─────────────────┬───────────────────────┘
                    │                 │
                    │ HTTP/REST       │ WebSocket
                    │ (Queries)       │ (Real-time)
                    ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER                           │
│  ┌────────────────┐              ┌────────────────┐         │
│  │  REST API      │              │  SOCKET.IO     │         │
│  │  (Express)     │              │  (WebSocket)   │         │
│  └───────┬────────┘              └────────┬───────┘         │
│          │                                │                 │
│          └────────────┬───────────────────┘                 │
│                       ▼                                     │
│           ┌───────────────────────┐                         │
│           │  MIDDLEWARE LAYER     │                         │
│           │  - Validation (Joi)   │                         │
│           │  - Error Handler      │                         │
│           │  - CORS               │                         │
│           └───────────┬───────────┘                         │
│                       ▼                                     │
│           ┌───────────────────────┐                         │
│           │    CONTROLLERS        │                         │
│           │  - Floors             │                         │
│           │  - Alerts             │                         │
│           │  - Export             │                         │
│           └───────────┬───────────┘                         │
│                       ▼                                     │
│           ┌───────────────────────┐                         │
│           │  SINGLETON SERVICES   │◄────── Shared State     │
│           │  - FloorSimulator     │                         │
│           │  - PredictionService  │                         │
│           │  - AlertService       │                         │
│           │  - EmailService       │                         │
│           └───────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │   IN-MEMORY STORE    │
            │  - Floor History     │
            │  - Active Alerts     │
            │  - Predictions Cache │
            └──────────────────────┘
```

### Características Clave

- **Simulación en Tiempo Real**: Genera datos de sensores cada 60 segundos
- **Comunicación Bidireccional**: REST para queries + WebSocket para push
- **Servicios Singleton**: Estado compartido entre REST y WebSocket
- **Sin Base de Datos**: Almacenamiento en memoria (hackathon simplicity)
- **Algoritmos ML**: Predicciones híbridas (MA + LR)
- **Sistema de Alertas**: Detección reactiva + preventiva

---

## Patrones de Diseño

### 1. Singleton Pattern

**Problema**: Controllers REST y eventos Socket.IO necesitan acceder al mismo estado.

**Solución**: Servicios singleton inicializados en `src/sockets/index.js`.

```javascript
// src/sockets/index.js
let simulator = null;
let predictionService = null;
let alertService = null;

function initializeServices(io) {
  // Crear instancias únicas
  simulator = new FloorSimulator(/* config */);
  predictionService = new PredictionService();
  alertService = new AlertService(/* config */);
  
  // Iniciar simulación
  startSimulation(io);
}

// Getters exportados
module.exports = {
  initializeSocket,
  getSimulator: () => simulator,
  getPredictionService: () => predictionService,
  getAlertService: () => alertService,
};
```

**Uso en Controllers**:

```javascript
// src/controllers/floors.controller.js
const { getSimulator } = require('../sockets/index');

const getFloors = (req, res) => {
  const simulator = getSimulator();  // Mismo singleton
  
  if (!simulator) {
    return res.status(503).json({
      success: false,
      message: 'Simulador no inicializado'
    });
  }
  
  const data = simulator.getCurrentData();
  res.json({ success: true, data });
};
```

**Beneficios**:
- ✅ Estado consistente entre REST y WebSocket
- ✅ Fácil de testear (inyección de dependencias)
- ✅ Gestión centralizada del ciclo de vida

---

### 2. Observer Pattern (Pub/Sub)

**Problema**: Notificar a múltiples clientes cuando hay nuevos datos.

**Solución**: Socket.IO broadcast + event emitters.

```javascript
// src/sockets/index.js
function startSimulation(io) {
  setInterval(() => {
    // 1. Generar datos
    const floors = simulator.generateData();
    
    // 2. Detectar anomalías
    const alerts = alertService.detectAnomalies(floors);
    
    // 3. Generar predicciones
    const predictions = predictionService.generatePredictions(floors);
    
    // 4. Broadcast a TODOS los clientes conectados
    io.emit('floor-data', { floors, timestamp: new Date() });
    
    if (alerts.length > 0) {
      io.emit('new-alerts', { alerts, timestamp: new Date() });
    }
    
    io.emit('predictions', { predictions, timestamp: new Date() });
  }, INTERVAL);
}
```

**Beneficios**:
- ✅ Desacoplamiento (servicios no conocen a los clientes)
- ✅ Escalabilidad (agregar/quitar suscriptores sin cambiar lógica)
- ✅ Tiempo real (push en lugar de polling)

---

### 3. Strategy Pattern

**Problema**: Diferentes algoritmos de predicción para diferentes métricas.

**Solución**: Estrategia híbrida configurable.

```javascript
// src/services/prediction.services.js
class PredictionService {
  predictMetric(history, metric, minutesAhead) {
    // Estrategia 1: Moving Average (60%)
    const maPrediction = this.movingAverage(history, metric);
    
    // Estrategia 2: Linear Regression (40%)
    const lrPrediction = this.linearRegression(history, metric);
    
    // Combinación ponderada
    return (maPrediction * 0.6) + (lrPrediction * 0.4);
  }
}
```

**Beneficios**:
- ✅ Algoritmos intercambiables
- ✅ Fácil agregar nuevas estrategias
- ✅ Balanceo de precisión vs simplicidad

---

### 4. Middleware Chain Pattern

**Problema**: Validación, logging, error handling en cada request.

**Solución**: Cadena de middlewares de Express.

```javascript
// src/routes/floors.router.js
router.get(
  '/floors/:id',
  validatorHandler(floorParamsSchema, 'params'),    // 1. Validar
  validatorHandler(querySchema, 'query'),           // 2. Validar query
  getFloorById                                       // 3. Controller
);

// src/app.js
app.use(logErrors);          // 1. Log
app.use(boomErrorHandler);   // 2. Formatear Boom errors
app.use(errorHandler);       // 3. Catch-all
```

**Beneficios**:
- ✅ Separación de responsabilidades
- ✅ Reutilización (mismos validators en múltiples rutas)
- ✅ Orden de ejecución claro

---

## Componentes Principales

### 1. FloorSimulator

**Responsabilidad**: Generar datos sintéticos de sensores.

**Estado**:
```javascript
{
  currentData: Array<FloorData>,    // Último dato de cada piso
  history: Array<FloorData>,        // Histórico (max 1440 entries/piso)
  config: {
    numberOfFloors: number,
    buildingName: string,
    ranges: {
      temperature: { min, max },
      humidity: { min, max },
      occupancy: { min, max },
      powerConsumption: { min, max }
    }
  }
}
```

**Métodos clave**:
- `generateData()`: Crea nuevo dato con variación aleatoria
- `getCurrentData()`: Retorna estado actual
- `getHistory(floorId, limit)`: Retorna histórico filtrado
- `addToHistory(data)`: Agrega dato + limpia old entries

**Algoritmo de Generación**:
```javascript
generateData() {
  return floors.map(floor => ({
    floorId: floor.id,
    name: floor.name,
    // Valor anterior + ruido gaussiano
    temperature: previousTemp + gaussian(mean=0, stdDev=0.5),
    humidity: previousHum + gaussian(mean=0, stdDev=2),
    occupancy: previousOcc + randomWalk(-5, 5),
    powerConsumption: f(temperature, occupancy),  // Correlacionado
    timestamp: new Date().toISOString()
  }));
}
```

---

### 2. PredictionService

**Responsabilidad**: Generar predicciones futuras.

**Algoritmo Híbrido**:

```
Prediction = (MA × 0.6) + (LR × 0.4)

Donde:
- MA = Moving Average (últimos N valores)
- LR = Linear Regression (tendencia lineal)
```

**Implementación**:
```javascript
generatePredictions(floors) {
  return floors.map(floor => {
    const history = simulator.getHistory(floor.floorId, 60);
    
    return {
      floorId: floor.floorId,
      currentData: floor,
      predictions: {
        occupancy: this.predictMetric(history, 'occupancy', 60),
        temperature: this.predictMetric(history, 'temperature', 60),
        // ...
      }
    };
  });
}

predictMetric(history, metric, minutesAhead) {
  const points = 6;  // 6 puntos de predicción
  const interval = minutesAhead / points;
  
  return Array.from({ length: points }, (_, i) => {
    const ma = this.movingAverage(history, metric);
    const lr = this.linearRegression(history, metric, interval * (i + 1));
    
    return {
      minutesAhead: interval * (i + 1),
      [metric]: (ma * 0.6) + (lr * 0.4),
      timestamp: new Date(Date.now() + interval * (i + 1) * 60000)
    };
  });
}
```

**Confianza**:
- `high`: Varianza < 5%
- `medium`: Varianza 5-15%
- `low`: Varianza > 15%

---

### 3. AlertService

**Responsabilidad**: Detectar anomalías reactivas + preventivas.

**Tipos de Anomalías**:

| Tipo | Trigger | Severidad |
|------|---------|-----------|
| `thermal_overload` | temp > 30°C + power > 180 kWh | Critical |
| `high_temperature` | temp > 28°C | Warning |
| `high_humidity` | humidity > 80% | Warning |
| `high_power` | power > 200 kWh | Warning |
| `predictive_thermal_overload` | Predicción > 30°C en 10-60 min | Critical |
| `predictive_temperature` | Predicción > 28°C en 10-60 min | Warning |

**Algoritmo de Detección**:
```javascript
detectAnomalies(floors) {
  const alerts = [];
  
  floors.forEach(floor => {
    const currentAnomalies = this.detectCurrent(floor);
    const predictiveAnomalies = this.detectPredictive(floor);
    
    if (currentAnomalies.length > 0 || predictiveAnomalies.length > 0) {
      alerts.push({
        floorId: floor.floorId,
        severity: this.getMaxSeverity([...currentAnomalies, ...predictiveAnomalies]),
        type: predictiveAnomalies.length > 0 ? 'predictive' : 'current',
        anomalies: [...currentAnomalies, ...predictiveAnomalies],
        timestamp: new Date()
      });
    }
  });
  
  return alerts;
}

detectPredictive(floor) {
  const predictions = predictionService.predict(floor, 60);
  const anomalies = [];
  
  predictions.temperature.predictions.forEach(pred => {
    if (pred.temperature > 30 && pred.minutesAhead <= 60) {
      anomalies.push({
        type: 'predictive_thermal_overload',
        severity: 'critical',
        minutesAhead: pred.minutesAhead,
        predictedTime: pred.timestamp,
        message: `ALERTA CRÍTICA PREVENTIVA: Piso superará 30°C en ${pred.minutesAhead} minutos`
      });
    }
  });
  
  return anomalies;
}
```

**Gestión de Alertas Activas**:
- Límite: 100 alertas activas
- TTL: 24 horas (auto-cleanup cada hora)
- Duplicados: Previene alertas repetidas del mismo piso

---

### 4. EmailService (Skeleton)

**Responsabilidad**: Enviar notificaciones por email.

**Estado Actual**: Framework implementado, integración EmailJS pendiente.

**Features Implementadas**:
- Rate limiting (max 10 emails/hora)
- Cooldown por alerta (15 min)
- Enrutamiento de destinatarios por severidad
- Templates HTML

**Pendiente** (ver `EMAIL_SETUP.md`):
- Configurar EmailJS
- Implementar TODOs en `sendAlert()`, `sendTestEmail()`

---

## Flujo de Datos

### 1. Startup Sequence

```
index.js
  │
  ├─► Cargar .env
  │
  ├─► Importar src/app.js
  │     │
  │     ├─► Crear Express app
  │     ├─► Aplicar middlewares (CORS, JSON parser)
  │     ├─► Registrar rutas (/api/v1/floors, /api/v1/alerts, etc.)
  │     ├─► Crear HTTP server
  │     └─► Inicializar Socket.IO
  │           │
  │           └─► src/sockets/index.js::initializeSocket(io)
  │                 │
  │                 ├─► Crear FloorSimulator
  │                 ├─► Crear PredictionService
  │                 ├─► Crear AlertService
  │                 └─► startSimulation(io)
  │                       │
  │                       └─► setInterval (cada 60s)
  │
  └─► server.listen(PORT)
```

### 2. Simulation Loop (cada 60s)

```
Timer Tick (60s)
  │
  ├─► FloorSimulator.generateData()
  │     │
  │     ├─► Para cada piso:
  │     │     ├─► Obtener valor anterior
  │     │     ├─► Aplicar variación aleatoria
  │     │     └─► Correlacionar temperatura ↔ energía
  │     │
  │     └─► Guardar en history (limitar a 1440/piso)
  │
  ├─► AlertService.detectAnomalies(floors)
  │     │
  │     ├─► Detectar anomalías actuales (temp > 30°C, etc.)
  │     ├─► PredictionService.predict(floors, 60)
  │     │     │
  │     │     └─► Detectar anomalías preventivas (predicción > 30°C)
  │     │
  │     └─► Guardar alertas activas
  │
  ├─► PredictionService.generatePredictions(floors)
  │     │
  │     ├─► Para cada piso:
  │     │     ├─► Obtener historial (60 entradas)
  │     │     ├─► Para cada métrica:
  │     │     │     ├─► MA: promedio móvil
  │     │     │     ├─► LR: regresión lineal
  │     │     │     └─► Combinar: 60% MA + 40% LR
  │     │     └─► Calcular confianza
  │     │
  │     └─► Retornar 6 puntos de predicción
  │
  ├─► io.emit('floor-data', { floors })         ─► Todos los clientes
  ├─► io.emit('new-alerts', { alerts })         ─► Todos los clientes
  └─► io.emit('predictions', { predictions })   ─► Todos los clientes
```

### 3. REST Request Flow

```
Cliente HTTP
  │
  ├─► GET /api/v1/floors/1/history?limit=60
  │
  └─► Express Router (src/routes/floors.router.js)
        │
        ├─► Middleware: validatorHandler(floorParamsSchema, 'params')
        │     │
        │     └─► Joi.validate(req.params) ─► id = 1 ✅
        │
        ├─► Middleware: validatorHandler(historyQuerySchema, 'query')
        │     │
        │     └─► Joi.validate(req.query) ─► limit = 60 ✅
        │
        └─► Controller: getFloorHistory(req, res)
              │
              ├─► const simulator = getSimulator()
              │     │
              │     └─► Verificar !== null (503 si no)
              │
              ├─► simulator.getHistory(1, 60)
              │     │
              │     ├─► Filtrar history por floorId = 1
              │     └─► Limitar a últimas 60 entradas
              │
              └─► res.json({ success: true, data: history })
                    │
                    └─► Cliente recibe JSON
```

### 4. WebSocket Request-Response Flow

```
Cliente Socket.IO
  │
  ├─► socket.emit('request-history', { floorId: 1, limit: 120 })
  │
  └─► Servidor: socket.on('request-history', ...)
        │
        ├─► Validar data.floorId (1-100)
        ├─► Validar data.limit (1-1440)
        │
        ├─► const simulator = getSimulator()
        ├─► const history = simulator.getHistory(floorId, limit)
        │
        └─► socket.emit('history-data', { floorId, history })
              │
              └─► Cliente recibe evento 'history-data'
```

---

## Gestión de Estado

### In-Memory Store

**Estructura**:
```javascript
{
  // FloorSimulator
  currentData: [
    { floorId: 1, temperature: 25.5, ... },
    { floorId: 2, temperature: 26.2, ... }
  ],
  
  history: [
    { floorId: 1, temperature: 25.3, timestamp: '...' },
    { floorId: 1, temperature: 25.4, timestamp: '...' },
    // ... máximo 1440 por piso (24h)
  ],
  
  // AlertService
  activeAlerts: [
    { floorId: 1, severity: 'critical', timestamp: '...' },
    // ... máximo 100 alertas
  ],
  
  // EmailService
  emailRateLimit: {
    sent: 5,              // Emails enviados esta hora
    resetTime: '...',     // Cuándo resetear contador
    lastAlertTimes: {     // Cooldown por tipo
      'thermal_overload_floor_1': '...'
    }
  }
}
```

**Limitaciones**:
- ❌ Datos perdidos en restart
- ❌ No escalable a múltiples instancias (sin Redis)
- ❌ Límite de memoria (RAM)

**Mitigaciones**:
- Límite de 1440 históricos/piso (24h)
- Límite de 100 alertas activas
- Auto-cleanup cada hora

**Alternativas para Producción**:
- Redis para estado compartido
- PostgreSQL para historial
- MongoDB para alertas

---

## Estrategia de Simulación

### Generación Realista de Datos

**Temperatura**:
```javascript
// Variación gaussiana + patrón diurno
const hour = new Date().getHours();
const baseTemp = 22 + (Math.sin((hour - 6) / 24 * 2 * Math.PI) * 4);  // 18-26°C
const noise = gaussian(0, 0.5);  // Ruido
temperature = Math.max(18, Math.min(32, baseTemp + noise));
```

**Ocupación**:
```javascript
// Random walk con límites
const change = Math.random() < 0.5 ? -5 : 5;
occupancy = Math.max(0, Math.min(100, previousOccupancy + change));
```

**Energía** (correlacionada):
```javascript
// Función de temperatura + ocupación
const tempFactor = (temperature - 20) * 5;  // Más calor = más AC
const occFactor = occupancy * 1.5;          // Más gente = más energía
powerConsumption = 100 + tempFactor + occFactor + gaussian(0, 10);
```

---

## Sistema de Alertas

### Priorización

```
CRITICAL (🔴)
  └─► Acción inmediata
      ├─► thermal_overload (actual)
      └─► predictive_thermal_overload (10-60 min)

WARNING (🟡)
  └─► Monitoreo cercano
      ├─► high_temperature
      ├─► high_humidity
      └─► predictive_temperature

INFO (🔵)
  └─► Informativo
      └─► sudden_change
```

### Deduplicación

```javascript
// Evita alertas duplicadas del mismo piso en mismo minuto
const key = `${alert.type}_floor_${floor.floorId}`;
const lastAlert = this.lastAlertTimes.get(key);

if (lastAlert && Date.now() - lastAlert < 60000) {
  return;  // Skip duplicado
}

this.lastAlertTimes.set(key, Date.now());
```

---

## Predicciones ML

### Limitaciones del Enfoque Actual

**Pros**:
- ✅ Simple (no require librerías ML)
- ✅ Rápido (< 10ms)
- ✅ Interpretable

**Cons**:
- ❌ No captura patrones complejos
- ❌ Asume linealidad
- ❌ No considera estacionalidad

### Mejoras Futuras

**Algoritmos avanzados**:
- ARIMA (AutoRegressive Integrated Moving Average)
- Prophet (Facebook)
- LSTM (Deep Learning)

**Implementación con TensorFlow.js**:
```javascript
const tf = require('@tensorflow/tfjs-node');

class LSTMPredictor {
  async predict(history, metric) {
    const model = await this.loadModel();
    const tensor = tf.tensor2d(history.map(h => [h[metric]]));
    const prediction = model.predict(tensor);
    return prediction.dataSync();
  }
}
```

---

## Escalabilidad

### Límites Actuales

| Recurso | Límite | Razón |
|---------|--------|-------|
| Pisos | 100 | Configurable, RAM limitada |
| Historial/piso | 1440 (24h) | Limpieza automática |
| Clientes Socket.IO | ~1000 | Single-threaded Node.js |
| Requests/seg | ~500 | Sin rate limiting |

### Estrategias de Escalado

**Horizontal (Múltiples Instancias)**:
```
┌─────────────┐
│  Nginx LB   │
└──────┬──────┘
       │
   ┌───┴───┬───────┬────────┐
   │       │       │        │
┌──▼──┐ ┌──▼──┐ ┌──▼──┐  ┌──▼──┐
│ App1│ │ App2│ │ App3│  │ AppN│
└──┬──┘ └──┬──┘ └──┬──┘  └──┬──┘
   │       │       │        │
   └───┬───┴───────┴────────┘
       │
   ┌───▼────┐
   │  Redis │ ◄── Estado compartido
   └────────┘
```

**Vertical (Más Recursos)**:
- Incrementar NODE_OPTIONS=--max-old-space-size=4096
- Cluster mode (múltiples procesos)

**Optimizaciones**:
- Comprimir responses (gzip)
- Implementar rate limiting
- Cachear cálculos de predicciones

---

## Recursos Adicionales

- **[Código Fuente Completo](../../src/)** - Implementación
- **[API Reference](../api/API_REFERENCE.md)** - Endpoints
- **[Troubleshooting](TROUBLESHOOTING.md)** - Problemas comunes

---

<div align="center">

**¿Preguntas sobre la arquitectura?**  
[Abrir Issue](https://github.com/Kevinparra535/hackaton.smartfloors.backend/issues)

[⬆ Volver arriba](#️-arquitectura-del-sistema)

</div>
