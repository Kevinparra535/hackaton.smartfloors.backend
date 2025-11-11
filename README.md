# 🏢 SmartFloors Backend

Backend para monitoreo inteligente de pisos en tiempo real con predicciones y detección de anomalías.

## 🎯 Características

- **Simulación de datos**: Genera datos realistas por piso (1 registro/minuto)
- **API REST**: Endpoints para consultar datos históricos y estadísticas
- **WebSocket (Socket.IO)**: Transmisión de datos en tiempo real al frontend
- **Predicciones**: Algoritmos de promedio móvil y regresión lineal para predecir a +60 minutos
- **Detección de anomalías**: Sistema inteligente de alertas con recomendaciones
- **Validación de datos**: Schemas con Joi para validar todas las peticiones
- **Manejo de errores**: Sistema centralizado con @hapi/boom

## 📊 Métricas monitoreadas

Por cada piso se monitorean:
- **Ocupación**: Número de personas (0-100)
- **Temperatura**: Temperatura ambiente (18-30°C)
- **Humedad**: Porcentaje de humedad (30-70%)
- **Consumo energético**: kWh consumidos

## 🛠️ Stack tecnológico

- **Node.js + Express**: Servidor backend
- **Socket.IO**: Comunicación en tiempo real
- **Joi**: Validación de schemas
- **@hapi/boom**: Manejo de errores HTTP
- **CORS**: Configuración de origen cruzado
- **dotenv**: Variables de entorno

## 📁 Estructura del proyecto

```
backend/
├── src/
│   ├── app.js                      # Configuración de Express + Socket.IO
│   ├── controllers/
│   │   └── floors.controller.js    # Controladores de API REST
│   ├── middlewares/
│   │   ├── validator.handler.js    # Middleware de validación con Joi
│   │   └── errors.handler.js       # Middleware de manejo de errores
│   ├── models/                     # (Para futuros modelos de BD)
│   ├── routes/
│   │   ├── index.js                # Sistema de enrutamiento
│   │   ├── home.router.js          # Rutas del home
│   │   └── floors.router.js        # Rutas de pisos con validaciones
│   ├── schemas/
│   │   └── validator.schema.js     # Schemas de validación con Joi
│   ├── services/
│   │   ├── simulator.service.js    # Generador de datos simulados
│   │   ├── prediction.service.js   # Servicio de predicciones
│   │   └── alerts.service.js       # Detección de anomalías
│   ├── sockets/
│   │   └── index.js                # Configuración de Socket.IO
│   └── utils/
│       └── helpers.js              # Funciones auxiliares
├── data/
│   └── dataset.json                # Historial temporal (generado)
├── .env                            # Variables de entorno
├── .env.example                    # Ejemplo de configuración
├── .gitignore                      # Archivos ignorados por Git
├── index.js                        # Punto de entrada de la aplicación
├── package.json                    # Dependencias y scripts
├── README.md                       # Esta documentación
├── VALIDATION.md                   # Documentación de validaciones
└── SmartFloors.postman_collection.json  # Colección de Postman
```

## 🚀 Instalación

> **📖 Para instrucciones detalladas paso a paso, consulta [INSTALLATION.md](INSTALLATION.md)**

### Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/Kevinparra535/hackaton.smartfloors.backend.git
cd hackaton.smartfloors.backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

Variables principales:
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
SIMULATION_INTERVAL=60000
NUMBER_OF_FLOORS=5
```

### 4. Ejecutar el servidor

**Modo desarrollo** (con nodemon):
```bash
npm run dev
```

**Modo producción**:
```bash
npm start
```

### 5. Verificar funcionamiento

```bash
# Health check
curl http://localhost:3000/health

# Obtener todos los pisos
curl http://localhost:3000/api/v1/floors
```

## 📡 API REST Endpoints

### Base URL: `http://localhost:3000/api/v1`

#### 🏢 Pisos

| Método | Endpoint | Descripción | Validaciones |
|--------|----------|-------------|--------------|
| **GET** | `/floors` | Obtener todos los pisos | - |
| **GET** | `/floors/stats` | Estadísticas generales | - |
| **GET** | `/floors/:id` | Obtener un piso específico | `id`: 1-100 |
| **GET** | `/floors/:id/history` | Historial de un piso | `id`: 1-100<br>`limit`: 1-1440 (opcional) |
| **GET** | `/floors/:id/predictions` | Predicciones de un piso | `id`: 1-100<br>`minutesAhead`: 10-180 (opcional) |

#### 🚨 Alertas

| Método | Endpoint | Descripción | Validaciones |
|--------|----------|-------------|--------------|
| **GET** | `/alerts` | Obtener todas las alertas activas | - |

#### ❤️ Health Check

| Método | Endpoint | Descripción | Validaciones |
|--------|----------|-------------|--------------|
| **GET** | `/health` | Verificar estado del servidor | - |

### Ejemplo de respuesta exitosa

```json
{
  "success": true,
  "data": {
    "floorId": 1,
    "name": "Piso 1",
    "occupancy": 65,
    "temperature": 23.5,
    "humidity": 45,
    "powerConsumption": 132.5,
    "timestamp": "2025-11-11T10:30:00.000Z"
  },
  "timestamp": "2025-11-11T10:30:00.000Z"
}
```

### Ejemplo de respuesta con error de validación

```json
{
  "error": {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "El ID debe ser un número entero"
  }
}
```

## 🔌 WebSocket Events

### Cliente → Servidor

```javascript
// Solicitar datos históricos
socket.emit('request-history', { floorId: 1, limit: 60 });

// Solicitar predicciones
socket.emit('request-prediction', { floorId: 1, minutesAhead: 60 });

// Solicitar alertas
socket.emit('request-alerts');
```

### Servidor → Cliente

```javascript
// Datos iniciales al conectar
socket.on('initial-data', (data) => { ... });

// Datos en tiempo real (cada minuto)
socket.on('floor-data', (data) => { ... });

// Predicciones
socket.on('predictions', (data) => { ... });

// Nuevas alertas
socket.on('new-alerts', (data) => { ... });

// Datos históricos
socket.on('history-data', (data) => { ... });

// Datos de alertas
socket.on('alerts-data', (data) => { ... });
```

## 🔮 Sistema de predicciones

El sistema utiliza dos métodos combinados:

1. **Promedio móvil**: Calcula el promedio de las últimas N observaciones
2. **Regresión lineal**: Identifica tendencias en los datos

Las predicciones se generan para:
- **Ocupación**: Predicción de personas en el piso
- **Temperatura**: Predicción de temperatura ambiente
- **Consumo energético**: Predicción de kWh

## 🚨 Sistema de alertas

### Niveles de severidad

- **Critical**: Situación crítica que requiere acción inmediata
- **Warning**: Situación que requiere atención
- **Info**: Información relevante

### Tipos de anomalías detectadas

1. **Ocupación alta/crítica**: Cuando hay demasiadas personas
2. **Temperatura extrema**: Fuera de rangos confortables
3. **Humedad anormal**: Muy alta o muy baja
4. **Consumo energético elevado**: Desperdicio energético
5. **Cambios bruscos**: Variaciones repentinas en métricas

Cada alerta incluye:
- **Descripción del problema**
- **Valor actual de la métrica**
- **Recomendación de acción**

## 🧪 Testing

### Usando cURL

```bash
# Obtener todos los pisos
curl http://localhost:3000/api/v1/floors

# Obtener piso específico
curl http://localhost:3000/api/v1/floors/1

# Obtener historial con límite
curl "http://localhost:3000/api/v1/floors/1/history?limit=30"

# Obtener predicciones
curl "http://localhost:3000/api/v1/floors/1/predictions?minutesAhead=60"

# Obtener estadísticas
curl http://localhost:3000/api/v1/floors/stats

# Obtener alertas
curl http://localhost:3000/api/v1/alerts
```

### Usando Postman

Importa la colección de Postman incluida en el proyecto:
- **Archivo**: `SmartFloors.postman_collection.json`
- Incluye todos los endpoints con ejemplos
- Variables de entorno pre-configuradas
- Tests automáticos incluidos

### Linting y formato

```bash
# Ejecutar linter
npm run lint

# Formatear código
npm run format
```

### Script de validaciones

```bash
# Ejecutar pruebas de validación
chmod +x test-validation.sh
./test-validation.sh
```

## 📦 Deploy

### Render / Railway

1. Conectar repositorio de GitHub
2. Configurar variables de entorno
3. Build command: `npm install`
4. Start command: `npm start`

### Variables de entorno en producción

```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://tu-frontend.com
SIMULATION_INTERVAL=60000
NUMBER_OF_FLOORS=5
```

## 🔧 Desarrollo

### Agregar nuevas métricas

1. Actualizar `src/services/simulator.js` para generar los datos
2. Actualizar `src/services/prediction.js` para predecir la métrica
3. Actualizar `src/services/alerts.js` para detectar anomalías

### Modificar intervalos de simulación

Editar `.env`:
```env
SIMULATION_INTERVAL=30000  # 30 segundos
```

## 📝 Notas importantes

- Los datos se simulan automáticamente cada 60 segundos (configurable)
- El historial se mantiene en memoria (últimas 24 horas por piso)
- Las alertas antiguas se limpian automáticamente cada hora
- Todas las rutas están validadas con Joi
- Los errores se manejan de forma centralizada con @hapi/boom
- Para persistencia de datos, considerar integrar MongoDB

## 📚 Documentación adicional

- **[INSTALLATION.md](INSTALLATION.md)**: Guía completa de instalación paso a paso
- **[VALIDATION.md](VALIDATION.md)**: Documentación completa de validaciones y schemas
- **[API_TESTS.md](API_TESTS.md)**: Ejemplos de pruebas de la API con cURL
- **[SCHEMAS_IMPLEMENTED.md](SCHEMAS_IMPLEMENTED.md)**: Resumen de schemas implementados
- **[POSTMAN_GUIDE.md](POSTMAN_GUIDE.md)**: Guía detallada para usar Postman
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)**: Índice completo de toda la documentación
- **SmartFloors.postman_collection.json**: Colección de Postman para testing

## 🎯 Enlaces Rápidos

- 📖 [Instalación Detallada](INSTALLATION.md)
- 🧪 [Guía de Postman](POSTMAN_GUIDE.md)
- ✅ [Validaciones](VALIDATION.md)
- 📚 [Índice de Documentación](DOCUMENTATION_INDEX.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

ISC

## 👥 Autores

SmartFloors Team - Hackathon 2025
