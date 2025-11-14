# 🏢 SmartFloors Backend

> **"Un edificio que respira, predice y reacciona"**

Sistema backend inteligente que transforma edificios tradicionales en organismos vivos capaces de anticipar problemas, comunicarse en tiempo real y sugerir acciones preventivas.

---

## 🎯 Visión del Proyecto

**SmartFloors** no es solo un sistema de monitoreo: es una **reinterpretación del edificio como entidad consciente**.

Cada piso es un **organismo vivo** que:
- 🫁 **Respira** — Pulsa y reacciona según su estado térmico
- 🧠 **Piensa** — Predice problemas antes de que ocurran
- 💬 **Comunica** — Genera alertas con contexto y recomendaciones
- 🎨 **Se expresa** — Cambia de color, intensidad y comportamiento visual

**La metáfora central:**  
*"Si un edificio pudiera hablar, ¿qué nos diría? ¿Cómo expresaría su malestar, su eficiencia, su necesidad de atención?"*

SmartFloors responde esa pregunta fusionando:
- 🔬 **Ingeniería de datos** (simulación realista)
- 🤖 **Machine Learning** (predicciones híbridas)
- 🎭 **Narrativa visual** (experiencia inmersiva)
- ⚡ **Tiempo real** (comunicación instantánea)

---

## 🚀 Pitch de 3 Minutos

### El Problema
Los sistemas de monitoreo tradicionales son **reactivos**: detectan problemas cuando ya ocurrieron. Son fríos, tabulares, desconectados de la experiencia humana.

### Nuestra Solución
**SmartFloors Backend** es el cerebro de un sistema que:

1. **Simula** comportamiento realista de cada piso (ocupación, temperatura, humedad, energía)
2. **Predice** el futuro a +60 minutos con ML híbrido (Moving Average + Linear Regression)
3. **Detecta** 10 tipos de anomalías (actuales y preventivas)
4. **Comunica** en tiempo real vía WebSocket con frontend 3D inmersivo
5. **Recomienda** acciones específicas antes de que ocurran problemas

### La Diferencia Clave
No mostramos números en tablas. **Creamos una experiencia narrativa**:
- Un piso "estresado" pulsa más rápido y se torna rojizo
- Las predicciones no son gráficos: son estados futuros del organismo
- Las alertas no son errores: son el edificio pidiendo atención

### Impacto Técnico
- ⚡ **Real-time**: Socket.IO con broadcast cada 60s
- 🧠 **ML Predictions**: 6 puntos de predicción cada 10 min
- 🚨 **Smart Alerts**: Detección de sobrecarga térmica (temp + energía combinados)
- 📊 **Export**: CSV con filtros avanzados para análisis profundo
- 🏗️ **Arquitectura**: Servicios singleton compartidos entre REST y WebSocket

### Impacto Creativo
Transformamos el backend en un **motor de narrativa**:
- Cada dato tiene significado emocional
- Cada predicción es una anticipación dramática
- Cada alerta es un diálogo entre edificio y usuario

---

## 🏗️ Arquitectura del Sistema

### Visión de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND 3D                                 │
│              (React Three Fiber - Organismo Visual)                  │
│                                                                       │
│   🫁 Cada piso respira     🎨 Colores dinámicos                      │
│   📊 Gráficos en paredes   🔮 Predicciones flotantes                │
└────────────────┬──────────────────────┬─────────────────────────────┘
                 │                      │
                 │ REST (consultas)     │ WebSocket (stream)
                 │                      │
┌────────────────▼──────────────────────▼─────────────────────────────┐
│                      SMARTFLOORS BACKEND                             │
│                     (Express + Socket.IO)                            │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  🧠 SINGLETON SERVICES                        │   │
│  │                  (Estado compartido)                          │   │
│  │                                                               │   │
│  │  📊 FloorSimulator    🔮 PredictionService    🚨 AlertService│   │
│  │     │                     │                       │          │   │
│  │     ├─ Patrones horarios  ├─ MA + LR híbrido     ├─ 10 tipos│   │
│  │     ├─ Historia 24h       ├─ Confianza 0-1       ├─ Actual  │   │
│  │     └─ 1 tick/60s         └─ 6 proyecciones      └─ Prevent.│   │
│  └──────────────────────────────────────────────────────────────┘   │
│                               │                                      │
│                               ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  💾 IN-MEMORY STATE                           │   │
│  │                                                               │   │
│  │  • currentData (última lectura por piso)                     │   │
│  │  • history (1440 registros/piso = 24h)                       │   │
│  │  • alerts (con cleanup 24h)                                  │   │
│  │  • predictions (caché por piso)                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  🛡️ VALIDATION LAYER                          │   │
│  │                                                               │   │
│  │  Joi Schemas → validatorHandler → boom errors                │   │
│  │  Rangos: ID 1-100, History 1-1440, Predictions 10-180       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  🔌 API ENDPOINTS                             │   │
│  │                                                               │   │
│  │  REST:        GET /api/v1/floors                             │   │
│  │               GET /api/v1/floors/:id/history                 │   │
│  │               GET /api/v1/floors/:id/predictions             │   │
│  │               GET /api/v1/alerts                             │   │
│  │               GET /api/v1/export/alerts/csv                  │   │
│  │                                                               │   │
│  │  WebSocket:   emit 'floor-data' (broadcast cada 60s)         │   │
│  │               emit 'new-alerts' (cuando detectadas)          │   │
│  │               emit 'predictions' (cada tick)                 │   │
│  │               on 'request-history' (bajo demanda)            │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘
```

### Patrón Arquitectónico Clave: **Singleton Services**

**Decisión crítica:** Los servicios se inicializan UNA SOLA VEZ en `src/sockets/index.js` y se comparten entre REST y WebSocket.

```javascript
// ✅ CORRECTO - Controllers y WebSocket
const { getSimulator, getPredictionService } = require('../sockets/index');
const simulator = getSimulator(); // Instancia compartida

// ❌ INCORRECTO
const FloorSimulator = require('../services/simulator.services');
const simulator = new FloorSimulator(); // ¡Crea instancia duplicada!
```

**¿Por qué?**  
- Los servicios mantienen **estado en memoria** (historia, alertas)
- Múltiples instancias → **inconsistencia de datos**
- Socket.IO y REST deben ver el **mismo universo de datos**

---

## 🧠 Servicios Principales

### 1. 📊 FloorSimulator - El Corazón del Organismo

Simula el comportamiento realista de cada piso como si fuera un ser vivo.

**Características:**
- **Patrones horarios de ocupación**
  - Mañana (8-12h): Incremento gradual
  - Tarde (12-18h): Pico máximo
  - Noche (18-24h): Descenso
  - Madrugada (0-8h): Mínimo
  
- **Temperatura influenciada por ocupación**
  - Base: 20-24°C
  - +0.5°C por cada 10% de ocupación
  - Variación aleatoria ±2°C
  
- **Humedad con eventos extremos**
  - Rango normal: 30-60%
  - 5% probabilidad de picos (lluvia, fugas)
  
- **Consumo energético derivado**
  - Correlación con temperatura y ocupación
  - Rango: 80-200 kWh

**Historia en memoria:**
- Mantiene 1440 registros por piso (24h * 60min)
- Auto-pruning cuando se excede el límite
- Accesible vía REST o WebSocket

### 2. 🔮 PredictionService - El Profeta

Predice el futuro del edificio usando **Machine Learning híbrido**.

**Algoritmo:**
```
Predicción Final = (60% Moving Average) + (40% Linear Regression)
```

**¿Por qué híbrido?**
- **Moving Average**: Captura tendencias estables
- **Linear Regression**: Detecta cambios de dirección
- **Balance 60/40**: Estabilidad + reactividad

**Output:**
- 6 puntos de predicción: 10, 20, 30, 40, 50, 60 minutos
- Métricas: temperatura, humedad, ocupación, energía
- Nivel de confianza: 0.0 - 1.0 (normalizado)

**Visualización frontend:**
```
Predicción = estado futuro del organismo
No es un gráfico, es cómo "se sentirá" el piso en 60 min
```

### 3. 🚨 AlertService - El Sistema Nervioso

Detecta anomalías y genera **alertas contextuales con recomendaciones**.

**10 Tipos de Alertas:**

**Actuales (6):**
1. `occupancy` - Sobrecarga de personas
2. `temperature` - Temperatura extrema
3. `humidity` - Humedad peligrosa
4. `power` - Consumo energético alto
5. `thermal_overload` - **Combinación** temp + energía
6. `sudden_change` - Cambios bruscos en métricas

**Preventivas (4):**
7. `predictive_temperature` - Temperatura alta predicha
8. `predictive_humidity` - Humedad alta predicha
9. `predictive_power` - Consumo energético alto predicho
10. `predictive_thermal_overload` - Sobrecarga térmica futura

**Severidad:**
- `critical` - Acción inmediata requerida
- `warning` - Monitoreo necesario
- `info` - Información contextual

**Estructura de alerta:**
```json
{
  "floorId": 3,
  "floorName": "Piso 3",
  "severity": "critical",
  "type": "predictive",
  "timestamp": "2025-11-13T...",
  "anomalies": [
    {
      "type": "predictive_thermal_overload",
      "metric": "temperature",
      "value": 28.5,
      "minutesAhead": 60,
      "predictedTime": "2025-11-13T15:00:00Z",
      "message": "Sobrecarga térmica predicha en 60 minutos",
      "recommendation": "Reducir carga de equipos, activar ventilación"
    }
  ]
}
```

**Innovación:** No son errores, son **el edificio comunicándose**.

---

## ⚡ Flujo de Datos en Tiempo Real

### Pipeline de Simulación (cada 60s)

```
1. GENERATE DATA
   ↓
   FloorSimulator.generateData()
   → Crea registros para cada piso
   → Aplica patrones horarios
   → Añade a historia (con pruning)

2. DETECT ANOMALIES
   ↓
   AlertService.generateAlert()
   → Analiza cada piso vs historia
   → Compara con umbrales
   → Genera alertas actuales

3. PREDICT FUTURE
   ↓
   PredictionService.predictFloor()
   → Usa historia reciente (30 min)
   → Calcula MA + LR
   → Genera 6 proyecciones

4. GENERATE PREDICTIVE ALERTS
   ↓
   AlertService.generatePredictiveAlert()
   → Analiza predicciones
   → Detecta anomalías futuras
   → Asigna minutesAhead

5. EMIT TO CLIENTS
   ↓
   io.emit('floor-data', { floors, timestamp })
   io.emit('new-alerts', { alerts, timestamp })
   io.emit('predictions', { predictions, timestamp })
```

### Eventos WebSocket

**Server → Client (broadcast):**
```javascript
// Datos de pisos (cada 60s)
io.emit('floor-data', {
  floors: [...],  // Array de estados actuales
  timestamp: "2025-11-13T..."
});

// Alertas nuevas (cuando se detectan)
io.emit('new-alerts', {
  alerts: [...],  // Actuales + preventivas
  timestamp: "2025-11-13T..."
});

// Predicciones ML (cada tick)
io.emit('predictions', {
  predictions: [
    { floorId: 1, predictions: {...} },
    { floorId: 2, predictions: {...} }
  ],
  timestamp: "2025-11-13T..."
});
```

**Client → Server (request-response):**
```javascript
// Solicitar historial específico
socket.emit('request-history', { floorId: 3, limit: 120 });
socket.on('history-data', (data) => { /* ... */ });

// Solicitar predicción personalizada
socket.emit('request-prediction', { floorId: 3, minutesAhead: 120 });
socket.on('prediction-data', (data) => { /* ... */ });
```

---

## 🎨 Decisiones de Diseño Creativo-Técnicas

### 1. **Estado en Memoria vs Base de Datos**

**Decisión:** Sin base de datos, todo en RAM.

**Justificación técnica:**
- ⚡ Latencia ultra-baja para tiempo real
- 🔄 Simplicidad en hackathon (deploy rápido)
- 📊 24h de historia suficiente para patrones

**Justificación creativa:**
- El edificio vive en el "presente extendido"
- Su memoria es reciente, como un organismo
- La volatilidad refuerza la inmediatez

**Trade-off aceptado:**
- Restart = pérdida de datos (OK para demo)
- No escalable a producción (futura migración)

### 2. **Validación Estricta con Joi**

**Decisión:** Todos los endpoints validados, mensajes en español.

**Pattern:**
```javascript
router.get(
  '/floors/:id',
  validatorHandler(floorParamsSchema, 'params'),
  validatorHandler(getFloorHistorySchema, 'query'),
  getFloorById
);
```

**Justificación:**
- 🛡️ Seguridad: Previene inyecciones y datos malformados
- 🎯 UX: Mensajes claros en español para frontend
- 📐 Consistencia: Formato de error unificado

### 3. **Alertas Preventivas con ML**

**Decisión:** No solo detectar problemas, anticiparlos.

**Innovación:**
```
Alerta tradicional: "Temperatura alta AHORA"
SmartFloors: "Sobrecarga térmica EN 60 MINUTOS"
```

**Impacto narrativo:**
- El edificio no solo sufre, **advierte**
- Frontend puede visualizar el futuro (animaciones)
- Usuario tiene tiempo para actuar

### 4. **CSV Export con Helpers**

**Decisión:** Convertidores especializados para estructuras complejas.

**Problema:** Alertas tienen anomalías anidadas.

**Solución:**
```javascript
// src/utils/csv.helpers.js
alertsToCSV(alerts) {
  // Aplana: 1 alerta con 3 anomalías → 3 filas CSV
  // Preserva: timestamp, severidad, recomendación
  // Escapa: comillas, comas, saltos de línea
}
```

**Justificación:**
- 📊 Excel/Power BI compatibilidad
- 🔍 Análisis profundo post-hackathon
- 🎓 Datos exportables para investigación

---

## 📊 API REST Completa

### Health Check
```http
GET /health
→ { "status": "OK", "timestamp": "..." }
```

### Pisos (Floors)
```http
# Todos los pisos actuales
GET /api/v1/floors
→ { "success": true, "data": { "floors": [...] }, "timestamp": "..." }

# Piso específico
GET /api/v1/floors/:id
Params: id (1-100)
→ { "success": true, "data": {...}, "timestamp": "..." }

# Historial de piso
GET /api/v1/floors/:id/history?limit=120
Query: limit (1-1440, default 60)
→ { "success": true, "data": { "history": [...] }, "timestamp": "..." }

# Predicciones ML
GET /api/v1/floors/:id/predictions?minutesAhead=60
Query: minutesAhead (10-180, default 60)
→ { "success": true, "data": { "predictions": {...} }, "timestamp": "..." }

# Estadísticas del edificio
GET /api/v1/floors/stats
→ Promedios, máximos, mínimos, alertas activas
```

### Alertas
```http
GET /api/v1/alerts?severity=critical&floorId=3&type=thermal_overload
Query params:
  - severity: critical | warning | info
  - floorId: 1-100
  - type: occupancy | temperature | humidity | power | thermal_overload | sudden_change | predictive_*
  - isPredictive: true | false
  - limit: 1-1000 (default 100)
→ { "success": true, "data": { "alerts": [...], "total": 42 }, "timestamp": "..." }
```

### Exportación CSV
```http
# Estadísticas de exportación
GET /api/v1/export/stats
→ Total alertas, historial disponible, rangos de fechas

# Exportar alertas a CSV
GET /api/v1/export/alerts/csv?startDate=2025-11-01&severity=critical
Query params:
  - startDate, endDate (ISO 8601)
  - severity, floorId, type, isPredictive
→ Content-Type: text/csv; charset=utf-8
→ Content-Disposition: attachment; filename="smartfloors_alerts_*.csv"

# Exportar historial a CSV
GET /api/v1/export/history/csv?floorId=3&limit=1440
Query params:
  - startDate, endDate
  - floorId (específico)
  - limit (max 100,000)
→ CSV con timestamp, floorId, temp, humidity, occupancy, power
```

### Formato de Respuesta Estándar
```javascript
// Success
{
  "success": true,
  "data": { /* payload */ },
  "timestamp": "2025-11-13T..."
}

// Error (Joi validation)
{
  "error": {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "El ID debe ser un número entre 1 y 100"
  }
}

// Error (Service)
{
  "success": false,
  "message": "Simulador no inicializado",
  "error": "Service unavailable"
}
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 16+
- npm o yarn

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/Kevinparra535/hackaton.smartfloors.backend.git
cd hackaton.smartfloors.backend

# Instalar dependencias
npm install

# Configurar variables (opcional)
cp .env.example .env

# Iniciar servidor
npm run dev
```

**¡Servidor corriendo en `http://localhost:3000`!**

### Verificar
```bash
# Health check
curl http://localhost:3000/health

# Datos de pisos
curl http://localhost:3000/api/v1/floors

# WebSocket (con Socket.IO client)
# Conectar a ws://localhost:3000
# Escuchar evento: 'floor-data'
```

---

## 🧪 Testing

### Con Postman
Importar colección: `postman/SmartFloors.postman_collection.json`

**Requests incluidos:**
- ✅ Health check
- ✅ Floors (all, by ID, history, predictions, stats)
- ✅ Alerts (filtros combinados)
- ✅ Export (stats, alerts CSV, history CSV)
- ✅ Validaciones (edge cases)

### Scripts de prueba
```bash
# Validar schemas
bash test-validation.sh

# Probar mejoras
bash test-mejoras.sh

# Lint code
npm run lint
```

---

## 📐 Stack Tecnológico

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| **Runtime** | Node.js | 16+ | Servidor backend |
| **Framework** | Express.js | 4.x | REST API |
| **Real-time** | Socket.IO | 4.x | WebSocket bidireccional |
| **Validation** | Joi | 18.x | Schemas de validación |
| **Errors** | @hapi/boom | 10.x | HTTP errors estandarizados |
| **Dev** | Nodemon | 3.x | Auto-reload en desarrollo |
| **Quality** | ESLint + Prettier | Latest | Linting y formato |

---

## 🎓 Para el Jurado

### Innovación Técnica

1. **Arquitectura Singleton Compartida**
   - Patrón único: REST y WebSocket comparten estado
   - Decisión consciente para consistencia de datos
   - Implementación limpia con getters exportados

2. **ML Híbrido Personalizado**
   - No usamos librerías pesadas (TensorFlow, scikit-learn)
   - Algoritmo optimizado para tiempo real
   - Balance entre precisión y velocidad

3. **Sistema de Alertas Preventivas**
   - Innovación: combinar detección actual + predicción
   - Umbrales inteligentes basados en historia
   - Recomendaciones contextuales automáticas

4. **Pipeline de Validación**
   - Joi + closure factory pattern
   - Mensajes en español para UX
   - Zero trust en inputs

### Innovación Creativa

1. **Metáfora del Organismo Vivo**
   - Backend diseñado para "hablar" al frontend
   - Datos estructurados para narrativa visual
   - Estado térmico → comportamiento emocional

2. **Tiempo Real como Experiencia**
   - No solo enviar datos, crear **eventos dramáticos**
   - Alertas preventivas → tensión anticipatoria
   - Predicciones → esperanza/miedo del futuro

3. **Exportación como Herramienta Narrativa**
   - CSV no es solo datos, es la **memoria del edificio**
   - Filtros permiten "contar historias" específicas
   - Compatible con herramientas de visualización externas

### Complejidad Técnica

- ✅ WebSocket + REST sincronizados
- ✅ Algoritmo ML implementado desde cero
- ✅ Sistema de alertas con 10 tipos y 3 severidades
- ✅ Gestión de memoria (pruning de historia)
- ✅ Exportación CSV con escape de caracteres especiales
- ✅ Validación exhaustiva con Joi
- ✅ Manejo de errores en 3 capas (log → boom → catch-all)

### Decisiones de Diseño Justificadas

Cada decisión técnica tiene una justificación creativa:

| Decisión | Técnica | Creativa |
|----------|---------|----------|
| **In-memory state** | Latencia ultra-baja | Edificio vive en presente |
| **Singleton services** | Consistencia datos | Un único organismo |
| **Alertas preventivas** | ML + umbrales | Edificio que advierte |
| **WebSocket 60s** | Balance carga/real-time | Respiración del edificio |
| **Mensajes español** | UX local | Humanización del sistema |
| **CSV export** | Análisis externo | Memoria exportable |

---

## 📚 Documentación Adicional

- 📖 **[API Reference](docs/api/API_REFERENCE.md)** - Endpoints detallados
- ⚡ **[WebSocket Guide](docs/api/WEBSOCKET_GUIDE.md)** - Eventos en tiempo real
- 🏗️ **[Arquitectura](docs/development/ARCHITECTURE.md)** - Patrones de diseño
- 🔧 **[Configuración](docs/development/CONFIGURATION.md)** - Variables de entorno
- 🧪 **[Postman Guide](docs/guides/POSTMAN_GUIDE.md)** - Testing completo

---

## 🌟 Filosofía del Proyecto

> **"SmartFloors no es un sistema de monitoreo.  
> Es una conversación entre el edificio y quienes lo habitan.  
> Es ingeniería que cuenta historias.  
> Es datos que respiran."**

Este proyecto demuestra que:
- La **tecnología puede ser poética**
- El **código puede tener narrativa**
- Los **sistemas pueden tener alma**

Desarrollado para **Hackathon Universitario 2025** 🚀

---

## 📬 Contacto

- 🐛 **Issues**: [GitHub Issues](https://github.com/Kevinparra535/hackaton.smartfloors.backend/issues)
- 📚 **Docs**: `docs/` directory
- 📧 **Email**: support@smartfloors.com

---

<div align="center">

**⭐ Un edificio que respira, piensa y habla ⭐**

**Hecho con ❤️ por el equipo SmartFloors**

[⬆ Volver arriba](#-smartfloors-backend)

</div>
