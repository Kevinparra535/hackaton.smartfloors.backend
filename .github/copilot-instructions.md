# GitHub Copilot Instructions - SmartFloors Backend

## Contexto del Proyecto

Este es el backend de **SmartFloors**, un sistema de monitoreo inteligente de pisos en tiempo real desarrollado para un hackathon. El proyecto simula datos de edificios, realiza predicciones con ML y detecta anomalías.

## Stack Tecnológico

- **Runtime**: Node.js v16+
- **Framework**: Express.js 4.x
- **WebSocket**: Socket.IO 4.x
- **Validación**: Joi 18.x
- **Manejo de Errores**: @hapi/boom 10.x
- **CORS**: cors 2.x
- **Variables de Entorno**: dotenv 16.x
- **Dev Tools**: nodemon, eslint, prettier

## Estructura del Proyecto

```
src/
├── app.js                      # Configuración Express + Socket.IO
├── controllers/                # Controladores REST
│   └── floors.controller.js
├── middlewares/               # Middlewares personalizados
│   ├── validator.handler.js   # Validación con Joi
│   └── errors.handler.js      # Manejo de errores con Boom
├── routes/                    # Definición de rutas
│   ├── index.js
│   ├── home.router.js
│   └── floors.router.js       # Rutas con validaciones
├── schemas/                   # Schemas de validación Joi
│   └── validator.schema.js
├── services/                  # Lógica de negocio
│   ├── simulator.service.js   # Simulación de datos
│   ├── prediction.service.js  # Predicciones ML
│   └── alerts.service.js      # Detección de anomalías
├── sockets/                   # WebSocket con Socket.IO
│   └── index.js
└── utils/                     # Utilidades
    └── helpers.js
```

## Convenciones de Código

### Nomenclatura

- **Archivos**: `nombre.tipo.js` (ej: `floors.controller.js`, `validator.schema.js`)
- **Variables**: camelCase (ej: `floorData`, `occupancyLevel`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `MAX_OCCUPANCY`, `DEFAULT_LIMIT`)
- **Funciones**: camelCase descriptivo (ej: `getAllFloors`, `calculatePrediction`)
- **Clases**: PascalCase (ej: `FloorSimulator`, `PredictionService`)

### Estilo

- **Idioma**: Comentarios y mensajes en español
- **Comillas**: Simples para strings ('texto')
- **Punto y coma**: Opcional pero consistente
- **Indentación**: 2 espacios
- **Línea máxima**: 100 caracteres preferentemente

### Comentarios

```javascript
/**
 * Descripción detallada de la función
 * @param {Type} param - Descripción del parámetro
 * @returns {Type} - Descripción del retorno
 */
```

## Patrones de Desarrollo

### 1. Controladores

```javascript
const getNombreRecurso = (req, res) => {
  try {
    // Lógica del controlador
    res.json({
      success: true,
      data: resultado,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error en getNombreRecurso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recurso',
      error: error.message,
    });
  }
};
```

### 2. Rutas con Validación

```javascript
const validatorHandler = require('../middlewares/validator.handler');
const { schema } = require('../schemas/validator.schema');

router.get(
  '/ruta/:id',
  validatorHandler(schema, 'params'),
  controlador
);
```

### 3. Schemas Joi

```javascript
const Joi = require('joi');

const schema = Joi.object({
  campo: Joi.number().integer().min(1).max(100).required().messages({
    'number.base': 'El campo debe ser un número',
    'number.min': 'El campo debe ser mayor o igual a 1',
    'any.required': 'El campo es requerido',
  }),
});
```

### 4. Servicios (Clases)

```javascript
class NombreService {
  constructor() {
    this.data = [];
  }

  metodo(params) {
    // Implementación
    return resultado;
  }
}

module.exports = NombreService;
```

### 5. Respuestas API

**Éxito:**
```javascript
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-11-11T..."
}
```

**Error de validación (400):**
```javascript
{
  "error": {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Descripción del error en español"
  }
}
```

**Error del servidor (500):**
```javascript
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos"
}
```

## Validaciones

### Reglas Implementadas

- **ID de piso**: Número entero entre 1 y 100
- **Límite de historial**: Número entero entre 1 y 1440 (24 horas)
- **Minutos de predicción**: Número entero entre 10 y 180 (3 horas)

### Usar validatorHandler

```javascript
const { schema } = require('../schemas/validator.schema');
const validatorHandler = require('../middlewares/validator.handler');

// En las rutas
router.get(
  '/endpoint/:id',
  validatorHandler(schema, 'params'),  // Validar params
  validatorHandler(querySchema, 'query'),  // Validar query
  controlador
);
```

## Manejo de Errores

### Con @hapi/boom

```javascript
const boom = require('@hapi/boom');

// Error 400 - Bad Request
throw boom.badRequest('Mensaje de error');

// Error 404 - Not Found
throw boom.notFound('Recurso no encontrado');

// Error 503 - Service Unavailable
throw boom.serverUnavailable('Servicio no disponible');
```

### Middleware de Errores

Ya implementado en `src/middlewares/errors.handler.js`:
- `logErrors` - Registra errores
- `boomErrorHandler` - Maneja errores de Boom
- `errorHandler` - Maneja otros errores

## Socket.IO

### Eventos del Servidor → Cliente

- `initial-data` - Datos iniciales al conectar
- `floor-data` - Datos en tiempo real (cada minuto)
- `predictions` - Predicciones generadas
- `new-alerts` - Nuevas alertas detectadas
- `history-data` - Datos históricos solicitados
- `alerts-data` - Alertas solicitadas

### Eventos Cliente → Servidor

- `request-history` - Solicitar historial: `{ floorId, limit }`
- `request-prediction` - Solicitar predicción: `{ floorId, minutesAhead }`
- `request-alerts` - Solicitar alertas

### Implementación

```javascript
socket.on('evento', (data) => {
  // Procesar solicitud
  socket.emit('respuesta', resultado);
});

// Para todos los clientes
io.emit('evento', datos);
```

## Datos Simulados

### Métricas por Piso

- **occupancy**: 0-100 (número de personas)
- **temperature**: 18-30°C (temperatura ambiente)
- **humidity**: 30-70% (humedad relativa)
- **powerConsumption**: kWh calculado según ocupación y temperatura

### Patrones Horarios

- 09:00-12:00: Alta ocupación (60-90 personas)
- 13:00-14:00: Ocupación media (30-50 personas)
- 15:00-18:00: Ocupación media-alta (50-80 personas)
- 19:00-06:00: Baja ocupación (5-20 personas)

## Predicciones

### Algoritmos Usados

1. **Promedio Móvil**: Últimas 10 observaciones
2. **Regresión Lineal Simple**: Tendencia histórica
3. **Método Híbrido**: Promedio ponderado de ambos (60% MA + 40% LR)

### Generar Predicciones

```javascript
const predictionService = new PredictionService();
const predictions = predictionService.predictFloor(history, 60);
```

## Alertas

### Niveles de Severidad

- **critical**: Requiere acción inmediata
- **warning**: Requiere atención
- **info**: Información relevante

### Tipos de Anomalías

- Ocupación alta/crítica
- Temperatura extrema
- Humedad anormal
- Consumo energético elevado
- Cambios bruscos

### Generar Alertas

```javascript
const alertService = new AlertService();
const alert = alertService.generateAlert(floorId, currentData, history);
```

## Variables de Entorno

```env
PORT=3000                    # Puerto del servidor
NODE_ENV=development         # Ambiente
CORS_ORIGIN=http://...       # URL frontend
SIMULATION_INTERVAL=60000    # Intervalo simulación (ms)
NUMBER_OF_FLOORS=5          # Número de pisos
```

## Testing

### Postman

- Colección completa en `SmartFloors.postman_collection.json`
- 13 requests con tests automáticos
- Variables configuradas

### cURL

```bash
# Obtener pisos
curl http://localhost:3000/api/v1/floors

# Con parámetros
curl "http://localhost:3000/api/v1/floors/1/history?limit=60"
```

## Documentación

### Archivos Disponibles

- `README.md` - Documentación principal
- `INSTALLATION.md` - Guía de instalación
- `VALIDATION.md` - Documentación de validaciones
- `POSTMAN_GUIDE.md` - Guía de Postman
- `QUICK_START.md` - Inicio rápido
- `DOCUMENTATION_INDEX.md` - Índice completo

## Buenas Prácticas

### 1. Siempre validar inputs

```javascript
// ✅ Correcto
router.get('/:id', validatorHandler(schema, 'params'), controller);

// ❌ Incorrecto
router.get('/:id', controller); // Sin validación
```

### 2. Usar try-catch en controladores

```javascript
// ✅ Correcto
const getFloor = (req, res) => {
  try {
    // Lógica
  } catch (error) {
    // Manejo de error
  }
};
```

### 3. Mensajes de error en español

```javascript
// ✅ Correcto
.messages({
  'number.base': 'El ID debe ser un número',
})

// ❌ Incorrecto
.messages({
  'number.base': 'ID must be a number',
})
```

### 4. Respuestas consistentes

```javascript
// ✅ Correcto
res.json({
  success: true,
  data: resultado,
  timestamp: new Date().toISOString(),
});

// ❌ Incorrecto
res.json(resultado); // Sin estructura
```

### 5. Logs descriptivos

```javascript
// ✅ Correcto
console.log(`📊 Datos generados | Alertas: ${alerts.length}`);

// ❌ Incorrecto
console.log(data); // Sin contexto
```

## Endpoints API

### Pisos

- `GET /api/v1/floors` - Todos los pisos
- `GET /api/v1/floors/stats` - Estadísticas
- `GET /api/v1/floors/:id` - Piso específico (validar id: 1-100)
- `GET /api/v1/floors/:id/history` - Historial (validar limit: 1-1440)
- `GET /api/v1/floors/:id/predictions` - Predicciones (validar minutesAhead: 10-180)

### Alertas

- `GET /api/v1/alerts` - Todas las alertas

### Health

- `GET /health` - Health check

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Producción
npm start

# Linting
npm run lint

# Formatear
npm run format

# Tests de validación
./test-validation.sh
```

## Notas Importantes

1. **Los datos no persisten** - Todo en memoria, se pierde al reiniciar
2. **Historial limitado** - Últimas 24 horas (1440 registros) por piso
3. **Alertas auto-limpieza** - Se eliminan después de 24 horas
4. **Intervalo configurable** - Modificar SIMULATION_INTERVAL en .env
5. **Todos los mensajes en español** - Errores, logs, respuestas

## Al Generar Código

### ✅ Hacer

- Usar las convenciones establecidas
- Agregar validaciones con Joi
- Incluir manejo de errores con try-catch
- Usar boom para errores HTTP
- Comentarios en español
- Respuestas con formato consistente
- Logs descriptivos con emojis

### ❌ Evitar

- Código sin validación
- Mensajes en inglés
- Respuestas sin estructura
- Código sin try-catch
- Variables en inglés cuando hay equivalente en español
- Código sin comentarios

## Extensiones Futuras

Si se solicita agregar funcionalidades, considerar:

- Usar la estructura existente de services/
- Agregar validaciones apropiadas
- Mantener el formato de respuestas
- Actualizar la documentación correspondiente
- Agregar tests en la colección de Postman
- Seguir los patrones establecidos

---

**Recuerda**: Este es un proyecto de hackathon enfocado en demostración. Priorizar funcionalidad clara y código legible sobre optimización prematura.
