# 🏗️ Decisiones Técnicas y Arquitectónicas

> **Documento técnico explicando el *por qué* detrás de cada decisión de diseño en SmartFloors Backend**

---

## 📋 Índice

- [Filosofía de Diseño](#filosofía-de-diseño)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Decisiones de Implementación](#decisiones-de-implementación)
- [Trade-offs y Justificaciones](#trade-offs-y-justificaciones)
- [Escalabilidad Futura](#escalabilidad-futura)

---

## Filosofía de Diseño

### Principio Rector: **"Creative Technology with Purpose"**

SmartFloors Backend no es solo código funcional. Cada decisión técnica está diseñada para:

1. **Servir la narrativa** - El edificio como organismo vivo
2. **Optimizar la experiencia** - Real-time fluido y predecible
3. **Facilitar la evolución** - Código limpio y modular
4. **Inspirar confianza** - Validación y manejo de errores robusto

**Mantra del proyecto:**
> *"Si no puede explicarse de forma elegante, no está bien diseñado."*

---

## Arquitectura del Sistema

### Decisión 1: **Servicios Singleton Compartidos**

#### La Decisión
Todos los servicios (FloorSimulator, PredictionService, AlertService) se instancian UNA SOLA VEZ en `src/sockets/index.js` y se comparten entre REST API y WebSocket vía funciones getter.

#### Código de Implementación
```javascript
// src/sockets/index.js
let simulator;
let predictionService;
let alertService;

function initializeSockets(io) {
  simulator = new FloorSimulator(numberOfFloors);
  predictionService = new PredictionService();
  alertService = new AlertService();
  // ...
}

function getSimulator() { return simulator; }
function getPredictionService() { return predictionService; }
function getAlertService() { return alertService; }

module.exports = { getSimulator, getPredictionService, getAlertService };
```

```javascript
// src/controllers/floors.controller.js
const { getSimulator } = require('../sockets/index');

const getAllFloors = (req, res) => {
  const simulator = getSimulator();
  if (!simulator) {
    return res.status(503).json({
      success: false,
      message: 'Simulador no inicializado'
    });
  }
  // ... usar simulator
};
```

#### ¿Por Qué?

**Problema que resuelve:**
- REST y WebSocket necesitan ver **el mismo universo de datos**
- Múltiples instancias → inconsistencia (historial diferente, alertas duplicadas)
- Estado compartido → memoria eficiente

**Alternativas consideradas:**
1. ❌ **Instancia por request** - Pérdida de contexto, sin historia
2. ❌ **Base de datos compartida** - Latencia inaceptable para real-time
3. ✅ **Singleton compartido** - Balance perfecto

**Trade-offs aceptados:**
- ⚠️ Complejidad de inicialización (orden de imports)
- ⚠️ Dificultad para testing (mocking singletons)
- ✅ Ganancia enorme en consistencia y performance

**Justificación creativa:**
> *El edificio es UN organismo, no múltiples entidades. El singleton refleja esta unicidad.*

---

### Decisión 2: **Estado en Memoria (Sin Base de Datos)**

#### La Decisión
Toda la data (historial, alertas, predicciones) vive en RAM. No hay PostgreSQL, MongoDB ni Redis.

#### Implementación
```javascript
// src/services/simulator.services.js
class FloorSimulator {
  constructor(numberOfFloors) {
    this.currentData = [];
    this.history = []; // Crece hasta 1440 registros/piso
  }

  generateData() {
    // ... generar nuevos datos
    this.history.push(...newData);
    
    // Pruning: mantener máximo 1440 registros por piso (24h)
    this.history.forEach(floorId => {
      const floorHistory = this.history.filter(h => h.floorId === floorId);
      if (floorHistory.length > 1440) {
        this.history = this.history.filter(/* remover más antiguos */);
      }
    });
  }
}
```

#### ¿Por Qué?

**Ventajas:**
- ⚡ **Latencia ultra-baja** - Lectura en microsegundos
- 🚀 **Deploy simple** - No gestión de DB en hackathon
- 🔄 **Rapidez desarrollo** - Sin ORM, migraciones, conexiones
- 💾 **Memoria suficiente** - 5 pisos × 1440 registros × 5 métricas = ~36KB

**Desventajas aceptadas:**
- ⚠️ **Volatilidad** - Restart = pérdida de datos
- ⚠️ **No escalable** - Límite de RAM en producción
- ⚠️ **Sin auditoría** - No hay log histórico permanente

**Justificación técnica:**
Para una **demo de hackathon**, la velocidad de desarrollo y la latencia son más valiosas que la persistencia. El proyecto está diseñado para **impresionar en vivo**, no para correr meses en producción.

**Justificación creativa:**
> *Un organismo vivo no recuerda TODO. Su memoria es reciente, vívida, presente. El edificio vive en el "ahora extendido" (24h).*

**Migración futura:**
```javascript
// Preparado para agregar capa de persistencia
class FloorSimulator {
  constructor(numberOfFloors, dbAdapter = null) {
    this.db = dbAdapter; // Inyección de dependencia
    // ...
  }

  async saveToDatabase() {
    if (this.db) await this.db.insert(this.history);
  }
}
```

---

### Decisión 3: **Express + Socket.IO en el Mismo Servidor**

#### La Decisión
HTTP y WebSocket comparten el mismo proceso Node.js y puerto.

#### Implementación
```javascript
// src/app.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app); // HTTP server
const io = new Server(server, {        // Socket.IO sobre HTTP
  cors: { origin: process.env.CORS_ORIGIN }
});

// Express routes
app.use('/api/v1', routes);

// Socket.IO initialization
initializeSockets(io);

// Exportar SERVER, no app
module.exports = { app, server, io };
```

```javascript
// index.js
const { server } = require('./src/app');
server.listen(PORT); // Un solo puerto para ambos
```

#### ¿Por Qué?

**Ventajas:**
- 🔗 **Simplicidad de deploy** - Un solo proceso, un puerto
- 📦 **Estado compartido fácil** - Mismo event loop
- 🌐 **CORS unificado** - Configuración centralizada
- 💰 **Recursos optimizados** - No duplicar servicios

**Alternativas consideradas:**
1. ❌ **Servidores separados** - Mayor complejidad, sincronización compleja
2. ❌ **Microservicios** - Overkill para hackathon
3. ✅ **Monolito cohesivo** - Balance perfecto

**Pattern crítico:**
```javascript
// ❌ INCORRECTO - Escuchar app.listen()
app.listen(PORT); // Socket.IO no funcionará

// ✅ CORRECTO - Escuchar server.listen()
server.listen(PORT); // HTTP + WebSocket funcionan
```

---

## Decisiones de Implementación

### Decisión 4: **Validación con Joi + Closure Factory**

#### La Decisión
Crear un middleware **reutilizable** que valida cualquier parte de `req` usando schemas Joi.

#### Implementación
```javascript
// src/middlewares/validator.handler.js
const boom = require('@hapi/boom');

function validatorHandler(schema, property) {
  return function (req, res, next) {
    const data = req[property]; // params, query, body, headers
    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      next(boom.badRequest(error.message));
    } else {
      next();
    }
  };
}

module.exports = validatorHandler;
```

```javascript
// src/routes/floors.router.js
const validatorHandler = require('../middlewares/validator.handler');
const { floorParamsSchema, getFloorHistorySchema } = require('../schemas/validator.schema');

router.get(
  '/floors/:id/history',
  validatorHandler(floorParamsSchema, 'params'),    // Valida :id
  validatorHandler(getFloorHistorySchema, 'query'), // Valida ?limit
  getFloorHistory                                    // Controller
);
```

```javascript
// src/schemas/validator.schema.js
const Joi = require('joi');

const floorParamsSchema = Joi.object({
  id: Joi.number().integer().min(1).max(100).required().messages({
    'number.base': 'El ID debe ser un número',
    'number.integer': 'El ID debe ser un número entero',
    'number.min': 'El ID debe ser mayor o igual a 1',
    'number.max': 'El ID debe ser menor o igual a 100',
    'any.required': 'El ID es requerido'
  })
});
```

#### ¿Por Qué?

**Ventajas del pattern:**
- 🔁 **Reutilizable** - Mismo middleware para params, query, body
- 🛡️ **Seguro** - Previene inyecciones y datos malformados
- 📝 **Mensajes claros** - Español para UX local
- 🎯 **Zero trust** - Nunca confiar en input del cliente

**Closure factory explained:**
```javascript
// validatorHandler RETORNA una función
// Esto permite parametrizar el middleware

const validateParams = validatorHandler(schema, 'params');
// validateParams es una función (req, res, next) => {...}

router.get('/floors/:id', validateParams, controller);
```

**Justificación creativa:**
> *El edificio solo escucha mensajes bien formados. La validación es su sistema de filtrado sensorial.*

---

### Decisión 5: **Manejo de Errores en 3 Capas**

#### La Decisión
Pipeline de error handling con responsabilidades separadas.

#### Implementación
```javascript
// src/app.js
const { logErrors, boomErrorHandler, errorHandler } = require('./middlewares/errors.handler');

// ORDEN CRÍTICO
app.use(logErrors);          // 1. Console logging
app.use(boomErrorHandler);   // 2. Boom errors → JSON
app.use(errorHandler);       // 3. Catch-all
```

```javascript
// src/middlewares/errors.handler.js

// Middleware 1: Logging
function logErrors(err, req, res, next) {
  console.error('❌ Error:', err);
  next(err); // Pasar al siguiente
}

// Middleware 2: Boom errors
function boomErrorHandler(err, req, res, next) {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  } else {
    next(err); // No es Boom, pasar al siguiente
  }
}

// Middleware 3: Catch-all
function errorHandler(err, req, res, next) {
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
}
```

#### ¿Por Qué?

**Separación de concerns:**
1. **logErrors** - Debugging (dev) y monitoreo (prod)
2. **boomErrorHandler** - Errores HTTP estandarizados (400, 404, etc)
3. **errorHandler** - Fallback para errores inesperados

**Pattern de uso en controllers:**
```javascript
const boom = require('@hapi/boom');

const getFloorById = (req, res, next) => {
  try {
    const { id } = req.params;
    const simulator = getSimulator();
    
    if (!simulator) {
      throw boom.serviceUnavailable('Simulador no inicializado');
    }
    
    const floor = simulator.getFloorById(id);
    if (!floor) {
      throw boom.notFound(`Piso ${id} no encontrado`);
    }
    
    res.json({ success: true, data: floor });
  } catch (error) {
    next(error); // Delegar al pipeline de errores
  }
};
```

**Ventajas:**
- 🎯 **Consistencia** - Formato de error unificado
- 🔍 **Debugging** - Logs automáticos
- 🛡️ **Seguridad** - No exponer stack traces en producción
- 📊 **Monitoreo** - Fácil integrar Sentry, Winston, etc

---

### Decisión 6: **Algoritmo ML Híbrido Personalizado**

#### La Decisión
Implementar predicciones **desde cero** sin librerías pesadas (TensorFlow, scikit-learn).

#### Implementación
```javascript
// src/services/prediction.services.js

class PredictionService {
  predictFloor(history, minutesAhead = 60) {
    const predictions = {};
    const metrics = ['temperature', 'humidity', 'occupancy', 'powerConsumption'];
    
    metrics.forEach(metric => {
      const values = history.map(h => h[metric]);
      
      // Algoritmo híbrido: 60% MA + 40% LR
      const maPrediction = this.movingAverage(values);
      const lrPrediction = this.linearRegression(values, minutesAhead);
      
      const finalPrediction = (maPrediction * 0.6) + (lrPrediction * 0.4);
      
      predictions[metric] = {
        value: finalPrediction,
        confidence: this.calculateConfidence(values),
        points: this.generateProjections(values, 6) // 10, 20, 30, 40, 50, 60 min
      };
    });
    
    return predictions;
  }

  movingAverage(values, window = 5) {
    const recent = values.slice(-window);
    return recent.reduce((a, b) => a + b) / recent.length;
  }

  linearRegression(values, minutesAhead) {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    // y = mx + b
    const sumX = x.reduce((a, b) => a + b);
    const sumY = y.reduce((a, b) => a + b);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    
    return m * (n + minutesAhead) + b;
  }

  calculateConfidence(values) {
    // Confianza basada en varianza
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Normalizar: baja varianza = alta confianza
    return Math.max(0, Math.min(1, 1 - (stdDev / mean)));
  }
}
```

#### ¿Por Qué?

**Ventajas:**
- 🚀 **Performance** - Sin overhead de librerías pesadas
- 🎯 **Control total** - Ajuste fino del algoritmo
- 📦 **Bundle pequeño** - 0 dependencias ML
- 🧠 **Aprendizaje** - Entender el math detrás

**¿Por qué híbrido?**
- **Moving Average** - Estabilidad, suaviza ruido
- **Linear Regression** - Detecta tendencias, cambios de dirección
- **Balance 60/40** - Experimentación empírica (mejores resultados)

**Trade-offs aceptados:**
- ⚠️ **Precisión limitada** - No es LSTM, no es deep learning
- ⚠️ **Sin entrenamiento** - Modelo estático
- ✅ **Suficiente para demo** - Predicciones creíbles y rápidas

**Justificación creativa:**
> *El edificio no necesita inteligencia artificial compleja. Necesita intuición rápida y confiable, como un organismo adaptándose a su entorno.*

**Resultados visuales:**
```
Temperatura actual: 23.5°C
Predicción +60min: 25.2°C (confianza 0.85)

Frontend interpreta:
- Color: Naranja (calentándose)
- Pulso: Moderado (anticipación)
- Mensaje: "Se espera incremento térmico en 1 hora"
```

---

### Decisión 7: **Sistema de Alertas Actuales + Preventivas**

#### La Decisión
No solo detectar problemas cuando ocurren, sino **anticiparlos** usando predicciones.

#### Implementación
```javascript
// src/services/alerts.services.js

class AlertService {
  // ALERTAS ACTUALES
  generateAlert(floorId, currentData, history) {
    const anomalies = [];
    
    // Detectar temperatura alta
    if (currentData.temperature > 26) {
      anomalies.push({
        type: 'temperature',
        metric: 'temperature',
        value: currentData.temperature,
        message: 'Temperatura por encima del rango normal',
        recommendation: 'Activar sistema de ventilación'
      });
    }
    
    // Detectar SOBRECARGA TÉRMICA (innovación)
    const isThermalOverload = 
      currentData.temperature > 25 && 
      currentData.powerConsumption > 150;
    
    if (isThermalOverload) {
      anomalies.push({
        type: 'thermal_overload',
        metric: 'combined',
        value: `${currentData.temperature}°C + ${currentData.powerConsumption}kWh`,
        message: 'Sobrecarga térmica detectada (temp + energía)',
        recommendation: 'Reducir carga de equipos, activar enfriamiento'
      });
    }
    
    if (anomalies.length > 0) {
      return {
        floorId,
        severity: this.calculateSeverity(anomalies),
        type: 'current',
        anomalies,
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  }

  // ALERTAS PREVENTIVAS (usando predicciones ML)
  generatePredictiveAlert(floorId, floorName, predictions, currentPower) {
    const anomalies = [];
    
    predictions.forEach((pred, index) => {
      const minutesAhead = (index + 1) * 10;
      const predictedTime = new Date(Date.now() + minutesAhead * 60000);
      
      // Predecir sobrecarga térmica FUTURA
      if (pred.temperature.value > 26 && currentPower > 140) {
        anomalies.push({
          type: 'predictive_thermal_overload',
          metric: 'temperature',
          value: pred.temperature.value,
          minutesAhead,
          predictedTime: predictedTime.toISOString(),
          message: `Sobrecarga térmica predicha en ${minutesAhead} minutos`,
          recommendation: 'Acción preventiva: reducir carga ahora'
        });
      }
    });
    
    if (anomalies.length > 0) {
      return {
        floorId,
        floorName,
        severity: 'warning',
        type: 'predictive',
        anomalies,
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  }
}
```

#### ¿Por Qué?

**Innovación clave:**
| Alerta Tradicional | SmartFloors |
|--------------------|-------------|
| "Temperatura alta AHORA" | "Sobrecarga térmica EN 60 MIN" |
| Reactivo | Preventivo |
| Responder | Anticipar |

**Umbrales inteligentes:**
```javascript
// No son valores fijos, son contextuales
const isAnomaly = value > threshold && trend === 'increasing';
```

**Tipos de detección:**
1. **Simple** - Un valor excede umbral
2. **Combinada** - Múltiples métricas (thermal_overload)
3. **Temporal** - Cambios bruscos en ventana de tiempo
4. **Predictiva** - Proyección futura excede umbral

**Justificación creativa:**
> *Un organismo sano no solo siente dolor, anticipa amenazas. Las alertas preventivas son el instinto de supervivencia del edificio.*

---

### Decisión 8: **Exportación CSV con Helpers Especializados**

#### La Decisión
Crear utilidades que **aplanan estructuras complejas** para compatibilidad con herramientas de análisis.

#### Implementación
```javascript
// src/utils/csv.helpers.js

function alertsToCSV(alerts) {
  const flattenedAlerts = [];
  
  alerts.forEach(alert => {
    // PROBLEMA: Cada alerta tiene múltiples anomalías anidadas
    // SOLUCIÓN: 1 alerta con 3 anomalías → 3 filas CSV
    
    if (alert.anomalies && alert.anomalies.length > 0) {
      alert.anomalies.forEach(anomaly => {
        flattenedAlerts.push({
          timestamp: alert.timestamp,
          floorId: alert.floorId,
          floorName: alert.floorName,
          severity: alert.severity,
          type: anomaly.type,
          metric: anomaly.metric,
          value: anomaly.value,
          message: anomaly.message,
          recommendation: anomaly.recommendation,
          isPredictive: alert.type === 'predictive' ? 'Si' : 'No',
          minutesAhead: anomaly.minutesAhead || '',
          predictedTime: anomaly.predictedTime || ''
        });
      });
    }
  });
  
  return jsonToCSV(flattenedAlerts);
}

function jsonToCSV(data, headers = null) {
  const csvHeaders = headers || Object.keys(data[0]);
  
  const dataLines = data.map(row => {
    return csvHeaders.map(header => {
      let value = row[header];
      
      // Escape especial para CSV
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') value = JSON.stringify(value);
      
      value = String(value);
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      
      return value;
    }).join(',');
  });
  
  return [csvHeaders.join(','), ...dataLines].join('\n');
}
```

#### ¿Por Qué?

**Problema:**
```json
// Estructura backend (compleja)
{
  "floorId": 3,
  "severity": "critical",
  "anomalies": [
    { "type": "temperature", "value": 28 },
    { "type": "humidity", "value": 65 },
    { "type": "power", "value": 180 }
  ]
}

// Excel/Power BI necesita (tabular)
floorId | severity | type        | value
3       | critical | temperature | 28
3       | critical | humidity    | 65
3       | critical | power       | 180
```

**Ventajas:**
- 📊 **Excel compatibilidad** - Pivot tables, filtros
- 🔍 **Power BI/Tableau** - Import directo
- 🐍 **Python/R** - pd.read_csv() funciona
- 📈 **Análisis profundo** - Post-hackathon research

**Escape de caracteres crítico:**
```javascript
// Manejo de casos edge
value = "Mensaje: reducir carga, activar ventilación"
// CSV: "Mensaje: reducir carga, activar ventilación"
// (comillas porque tiene coma interna)

value = 'Alerta "crítica"'
// CSV: "Alerta ""crítica"""
// (escape de comillas dobles)
```

---

## Trade-offs y Justificaciones

### Trade-off 1: **Simulación vs Datos Reales**

**Decisión:** Generar datos sintéticos en lugar de conectar sensores IoT reales.

**Justificación hackathon:**
- ⏰ **Tiempo limitado** - No hay tiempo para hardware
- 🎯 **Foco en software** - Demostrar capacidades de procesamiento
- 🎨 **Control narrativo** - Datos predecibles para storytelling
- 🚀 **Deploy simple** - No dependencias de hardware

**Simulación realista:**
```javascript
// Patrones basados en investigación real
const occupancyByHour = {
  '8-12': 'gradual increase',  // Llegada al trabajo
  '12-14': 'peak',              // Mediodía
  '14-18': 'high sustained',    // Tarde productiva
  '18-24': 'gradual decrease',  // Salida
  '0-8': 'minimum'              // Noche
};
```

**Migración futura:**
```javascript
// Interface preparada para IoT real
class FloorSimulator {
  generateData() {
    if (this.iotAdapter) {
      return this.iotAdapter.fetchRealData();
    } else {
      return this.simulateData();
    }
  }
}
```

---

### Trade-off 2: **Monolito vs Microservicios**

**Decisión:** Arquitectura monolítica (Express + Socket.IO en un proceso).

**Justificación:**
- 📦 **Simplicidad** - Un deploy, un proceso
- 🔗 **Estado compartido fácil** - Mismo event loop
- 🐛 **Debugging simple** - Stack traces completos
- 💰 **Recursos limitados** - No hay budget para Kubernetes

**Cuándo microservicios:**
```
Si necesitáramos:
- ✅ Escalar predicciones independientemente
- ✅ Múltiples equipos trabajando
- ✅ SLAs diferentes por servicio
- ✅ Deploy independiente de componentes

Para hackathon:
- ❌ Overkill
- ❌ Complejidad innecesaria
```

---

### Trade-off 3: **JavaScript vs TypeScript**

**Decisión:** Usar JavaScript puro (Node.js).

**Justificación:**
- ⚡ **Velocidad desarrollo** - Sin compilación
- 🎯 **Familiaridad equipo** - Todos conocen JS
- 📦 **Menos setup** - No tsconfig, no tipos
- 🐛 **Debugging directo** - Sin source maps

**Compensación:**
- ✅ **JSDoc para tipos críticos**
- ✅ **ESLint strict mode**
- ✅ **Validación Joi exhaustiva**

```javascript
/**
 * Genera predicciones para un piso
 * @param {Array<Object>} history - Historial del piso
 * @param {number} minutesAhead - Minutos a predecir
 * @returns {Object} Predicciones por métrica
 */
predictFloor(history, minutesAhead = 60) {
  // ...
}
```

---

## Escalabilidad Futura

### Roadmap Técnico Post-Hackathon

#### Fase 1: **Persistencia** (Semana 1-2)
```javascript
// Migrar a PostgreSQL
class FloorSimulator {
  constructor(dbPool) {
    this.db = dbPool;
    this.cache = new Map(); // Redis futuro
  }

  async generateData() {
    const data = this.simulateData();
    await this.db.query('INSERT INTO floor_history VALUES ($1, $2, ...)', data);
    return data;
  }
}
```

**Stack sugerido:**
- PostgreSQL + TimescaleDB (time-series)
- Redis para caché de predicciones
- Sequelize ORM

#### Fase 2: **Autenticación** (Semana 3)
```javascript
// JWT + roles
router.get('/floors', 
  authMiddleware,
  roleMiddleware(['admin', 'viewer']),
  getAllFloors
);
```

**Stack sugerido:**
- Passport.js + JWT
- bcrypt para passwords
- Refresh tokens

#### Fase 3: **Escalabilidad Horizontal** (Mes 2)
```
Load Balancer (Nginx)
   ├── Backend Instance 1 (REST)
   ├── Backend Instance 2 (REST)
   └── Backend Instance 3 (REST)
          ↓
   Socket.IO Cluster (Sticky sessions)
          ↓
   Redis Pub/Sub (broadcast entre instancias)
          ↓
   PostgreSQL (Read replicas)
```

**Desafíos:**
- Socket.IO sticky sessions
- Estado compartido vía Redis
- Sincronización de alertas

#### Fase 4: **ML Avanzado** (Mes 3)
```python
# Migrar predicciones a Python + TensorFlow
# API endpoint separado

from tensorflow import keras
import numpy as np

model = keras.models.load_model('floor_predictor.h5')

def predict_floor(history):
    X = preprocess(history)
    predictions = model.predict(X)
    return postprocess(predictions)
```

**Stack sugerido:**
- TensorFlow/PyTorch
- FastAPI para servir modelo
- gRPC para comunicación rápida con Node.js

---

## Conclusión

Cada decisión técnica en SmartFloors Backend tiene:

1. **Justificación técnica** - Por qué es la mejor solución para el problema
2. **Justificación creativa** - Cómo sirve a la narrativa del edificio vivo
3. **Trade-offs explícitos** - Qué sacrificamos y por qué
4. **Path de evolución** - Cómo mejorar en el futuro

**El resultado:**
Un backend que es **eficiente, elegante y expresivo**. No solo funciona, **cuenta una historia**.

---

*Desarrollado con Creative Technology mindset para Hackathon 2025* 🚀
