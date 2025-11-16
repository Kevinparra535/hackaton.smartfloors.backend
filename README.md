# 🏢 SmartFloors Backend

> **"Un edificio que respira, predice y reacciona"**

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black)](https://socket.io/)
[![License](https://img.shields.io/badge/license-ISC-blue)](LICENSE)
![Winner](https://img.shields.io/badge/🏆_Hackathon_Winner-1st_Place-blue?style=for-the-badge)

Backend para sistema de monitoreo inteligente de edificios en tiempo real con predicciones ML y detección de anomalías.

**Desarrollado para Hackathon Universitario 2025** 🚀

---

## 🎯 ¿Qué es SmartFloors?

SmartFloors transforma edificios tradicionales en **organismos vivos** capaces de:

- 🫁 **Respirar** — Cada piso pulsa y reacciona según su estado térmico
- 🧠 **Predecir** — Anticipa problemas hasta 180 minutos antes
- 🚨 **Comunicar** — Genera alertas contextuales con recomendaciones
- 📊 **Analizar** — Exporta datos para análisis profundo

---

## 📚 Documentación

### 🏆 Para Hackathon

- **[📘 HACKATHON_README.md](HACKATHON_README.md)** - README completo con pitch, arquitectura y visión
- **[🎨 Visión Creativa](docs/CREATIVE_VISION.md)** - Manifiesto: El edificio como organismo vivo
- **[🏗️ Decisiones Técnicas](docs/TECHNICAL_DECISIONS.md)** - Justificación de arquitectura
- **[📋 Guía para Jurado](docs/JUDGES_GUIDE.md)** - Criterios de evaluación

### 📖 Documentación General

- **[🏠 Centro de Documentación](docs/README.md)** - Índice completo
- **[⚡ Inicio Rápido](docs/guides/QUICK_START.md)** - Configura en 5 minutos
- **[🌐 API Reference](docs/api/API_REFERENCE.md)** - Endpoints completos
- **[🔌 WebSocket Guide](docs/api/WEBSOCKET_GUIDE.md)** - Tiempo real

---

## 🚀 Inicio Rápido

```bash
# 1. Clonar repositorio
git clone https://github.com/Kevinparra535/hackaton.smartfloors.backend.git
cd hackaton.smartfloors.backend

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor
npm run dev
```

**¡Servidor corriendo en `http://localhost:3000`!**

Verificar:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/floors
```

---

## ✨ Características Principales

### 📡 Monitoreo en Tiempo Real

- Datos actualizados cada 60 segundos vía WebSocket
- Historial de 24 horas por piso (1440 registros)
- Broadcast automático a todos los clientes conectados

### 🔮 Predicciones ML

- Algoritmo híbrido: 60% Moving Average + 40% Linear Regression
- Predicciones de 10 a 180 minutos al futuro
- Métricas: temperatura, humedad, ocupación, consumo energético

### 🚨 Sistema de Alertas Inteligente

- **10 tipos de alertas**: 6 actuales + 4 preventivas
- **Detección de sobrecarga térmica** (temperatura + energía combinados)
- **Alertas preventivas**: Anticipa problemas antes de que ocurran
- Recomendaciones contextuales automáticas

### 📊 Exportación CSV

- Filtros avanzados (fecha, severidad, piso, tipo)
- Compatible con Excel, Power BI, Python, R
- Helpers especializados para estructuras complejas

---

## 🏗️ Arquitectura

**Patrón clave:** Servicios Singleton compartidos entre REST y WebSocket

```
Express REST API  ←→  Singleton Services  ←→  Socket.IO WebSocket
                           ↓
                      In-Memory State
                   (History + Alerts)
```

**Stack:**

- Node.js 16+ + Express 4.x
- Socket.IO 4.x (WebSocket)
- Joi 18.x (Validación)
- @hapi/boom 10.x (Errores HTTP)

---

## 📊 API Endpoints

```http
# Pisos
GET  /api/v1/floors                    # Todos los pisos actuales
GET  /api/v1/floors/:id                # Piso específico
GET  /api/v1/floors/:id/history        # Historial (query: limit 1-1440)
GET  /api/v1/floors/:id/predictions    # Predicciones ML (query: minutesAhead 10-180)
GET  /api/v1/floors/stats              # Estadísticas del edificio

# Alertas
GET  /api/v1/alerts                    # Alertas activas (filtros: severity, floorId, type)

# Exportación
GET  /api/v1/export/stats              # Estadísticas de exportación
GET  /api/v1/export/alerts/csv         # Exportar alertas a CSV
GET  /api/v1/export/history/csv        # Exportar historial a CSV
```

**[Ver documentación completa de API →](docs/api/API_REFERENCE.md)**

---

## 🔌 WebSocket (Tiempo Real)

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3000");

// Datos de pisos (cada 60s)
socket.on("floor-data", (data) => {
	console.log(data.floors);
});

// Alertas nuevas
socket.on("new-alerts", (data) => {
	console.log(data.alerts);
});

// Predicciones ML
socket.on("predictions", (data) => {
	console.log(data.predictions);
});
```

**[Ver guía completa de WebSocket →](docs/api/WEBSOCKET_GUIDE.md)**

---

## 🧪 Testing

### Con Postman

Importar colección: `postman/SmartFloors.postman_collection.json`

### Scripts

```bash
npm run dev        # Desarrollo con auto-reload
npm start          # Producción
npm run lint       # Lint code
npm run format     # Format code
```

---

## ⚙️ Configuración

Variables de entorno (`.env`):

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
SIMULATION_INTERVAL=60000
NUMBER_OF_FLOORS=5
BUILDING_NAME=Edificio Principal
```

**[Ver configuración completa →](docs/development/CONFIGURATION.md)**

---

## 🎓 Para el Jurado

### Innovación Técnica

✅ Arquitectura singleton compartida (REST + WebSocket)  
✅ ML híbrido implementado desde cero  
✅ Sistema de alertas preventivas (único)  
✅ Exportación CSV con helpers especializados

### Innovación Creativa

✅ Metáfora del edificio como organismo vivo  
✅ Datos estructurados para narrativa visual  
✅ Alertas como "diálogo" entre edificio y usuario

### Complejidad

✅ WebSocket + REST sincronizados  
✅ Pipeline de validación con Joi + closure factory  
✅ Gestión de memoria con pruning inteligente  
✅ Manejo de errores en 3 capas

**[Ver guía completa para jurado →](docs/JUDGES_GUIDE.md)**

---

## 📂 Estructura del Proyecto

```
hackaton.smartfloors.backend/
├── src/
│   ├── controllers/      # Lógica de endpoints
│   ├── routes/           # Definición de rutas
│   ├── services/         # Servicios singleton (simulador, ML, alertas)
│   ├── schemas/          # Validaciones Joi
│   ├── middlewares/      # Validación y manejo de errores
│   ├── sockets/          # Configuración WebSocket
│   └── utils/            # Helpers (CSV, etc)
├── docs/                 # Documentación completa
├── postman/              # Colección Postman
└── index.js              # Punto de entrada
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

ISC License - ver [LICENSE](LICENSE)

---

## 📬 Enlaces

- 🐛 [Issues](https://github.com/Kevinparra535/hackaton.smartfloors.backend/issues)
- 📚 [Documentación](docs/)
- 🧪 [Postman Collection](postman/SmartFloors.postman_collection.json)

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella ⭐**

**Desarrollado con ❤️ para Hackathon 2025**

[⬆ Volver arriba](#-smartfloors-backend)

</div>

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org/)Backend para monitoreo inteligente de pisos en tiempo real con predicciones y detección de anomalías.

[![Express](https://img.shields.io/badge/Express-4.x-blue)](https://expressjs.com/)

[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black)](https://socket.io/)## 🎯 Características

[![License](https://img.shields.io/badge/license-ISC-blue)](LICENSE)

- **Simulación de datos**: Genera datos realistas por piso (1 registro/minuto)

> **Sistema de monitoreo en tiempo real con predicciones ML y detección de anomalías para edificios inteligentes**- **API REST**: Endpoints para consultar datos históricos y estadísticas

- **WebSocket (Socket.IO)**: Transmisión de datos en tiempo real al frontend

Desarrollado para Hackathon 2025 🚀- **Predicciones**: Algoritmos de promedio móvil y regresión lineal para predecir a +60 minutos

- **Detección de anomalías**: Sistema inteligente de alertas con recomendaciones

---- **Validación de datos**: Schemas con Joi para validar todas las peticiones

- **Manejo de errores**: Sistema centralizado con @hapi/boom

## 🎯 ¿Qué es SmartFloors?

## 📊 Datos Simulados

SmartFloors es un backend completo que simula y monitorea sensores IoT en edificios, proporcionando:

Cada piso genera datos realistas cada minuto:

- ⚡ **Monitoreo en tiempo real** vía WebSocket

- 🤖 **Predicciones con Machine Learning** (hasta 180 min al futuro)```json

- 🚨 **Detección inteligente de anomalías**{

- 🔮 **Alertas preventivas** antes de que ocurran problemas "buildingId": 1,

- 📊 **Exportación de datos** a CSV para análisis "buildingName": "Edificio Principal",

- 🌐 **API REST completa** con validaciones Joi "floorId": 1,

  "name": "Piso 1",

--- "occupancy": 75,

"temperature": 23.5,

## ✨ Características Principales "humidity": 45,

"powerConsumption": 125.40,

### 📡 Monitoreo en Tiempo Real "timestamp": "2025-11-11T..."

- **Datos por piso**: Temperatura, humedad, ocupación, consumo energético}

- **WebSocket**: Actualización automática cada 60 segundos```

- **Historial**: Hasta 24 horas de datos (1440 registros)

### 🔮 Predicciones Inteligentes

- **Algoritmo híbrido**: 60% Moving Average + 40% Linear Regression
- **6 puntos de predicción**: Cada 10 minutos (10, 20, 30, 40, 50, 60 min)
- **Métricas**: Temperatura, humedad, ocupación, energía

### 🚨 Sistema de Alertas

- **10 tipos de alertas**:
  - 6 actuales (occupancy, temperature, humidity, power, thermal_overload, sudden_change)
  - 4 preventivas (predictive_temperature, predictive_humidity, predictive_power, predictive_thermal_overload)
- **3 niveles de severidad**: Critical, Warning, Info
- **Sobrecarga térmica**: Detección combinada (temperatura + energía)

### 📊 Exportación CSV

- Exportar alertas con filtros avanzados
- Exportar historial completo
- Compatible con Excel, Power BI, Python, R

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 16 o superior
- npm o yarn
- Git

### Instalación en 3 pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/Kevinparra535/hackaton.smartfloors.backend.git
cd hackaton.smartfloors.backend

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor
npm run dev
```

**¡Listo!** El servidor estará corriendo en `http://localhost:3000`

### Verificar instalación

```bash
# Probar health check
curl http://localhost:3000/health

# Ver datos de pisos
curl http://localhost:3000/api/v1/floors
```

---

## 📚 Documentación

### 🎓 Para Empezar

| Guía                                                               | Descripción                         |
| ------------------------------------------------------------------ | ----------------------------------- |
| **[⚡ Guía de Inicio Rápido](docs/guides/QUICK_START.md)**         | Primeros pasos en 5 minutos         |
| **[📦 Instalación Completa](docs/guides/INSTALLATION.md)**         | Configuración detallada paso a paso |
| **[🔌 Integración Frontend](docs/guides/FRONTEND_INTEGRATION.md)** | Conectar con React, Vue, Angular    |

### 📖 Guías de Uso

| Guía                                                      | Descripción                  |
| --------------------------------------------------------- | ---------------------------- |
| **[🌐 API REST Completa](docs/api/API_REFERENCE.md)**     | 23 endpoints documentados    |
| **[⚡ WebSocket en Vivo](docs/api/WEBSOCKET_GUIDE.md)**   | Eventos en tiempo real       |
| **[📊 Exportación CSV](docs/guides/EXPORT_CSV_GUIDE.md)** | Exportar datos para análisis |
| **[🧪 Testing Postman](docs/guides/POSTMAN_GUIDE.md)**    | 35 requests pre-configurados |

### 👨‍💻 Para Desarrolladores

| Documento                                                 | Descripción                          |
| --------------------------------------------------------- | ------------------------------------ |
| **[🏗️ Arquitectura](docs/development/ARCHITECTURE.md)**   | Estructura y patrones de diseño      |
| **[🔧 Configuración](docs/development/CONFIGURATION.md)** | Variables de entorno                 |
| **[📧 Email Setup](docs/development/EMAIL_SETUP.md)**     | Notificaciones por correo (opcional) |

---

## 📡 API Rápida

### Health Check

```http
GET /health → { status: "OK", timestamp: "..." }
```

### Pisos

```http
GET /api/v1/floors                    # Todos los pisos actuales
GET /api/v1/floors/:id                # Piso específico
GET /api/v1/floors/:id/history        # Historial (query: limit 1-1440)
GET /api/v1/floors/:id/predictions    # Predicciones ML (query: minutesAhead 10-180)
GET /api/v1/floors/stats              # Estadísticas del edificio
```

### Alertas

```http
GET /api/v1/alerts                    # Todas las alertas activas
# Filtros: ?severity=critical&floorId=3&type=thermal_overload&limit=10
```

### Exportación

```http
GET /api/v1/export/stats              # Estadísticas de datos disponibles
GET /api/v1/export/alerts/csv         # Exportar alertas a CSV
GET /api/v1/export/history/csv        # Exportar historial a CSV
```

📖 **[Ver API completa con ejemplos](docs/api/API_REFERENCE.md)**

---

## 🔌 WebSocket - Tiempo Real

Conéctate a `ws://localhost:3000`:

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3000");

// Datos de pisos (cada 60s)
socket.on("floor-data", (data) => {
	console.log(data.floors); // Array con todos los pisos
	console.log(data.timestamp);
});

// Nuevas alertas
socket.on("new-alerts", (data) => {
	console.log(data.alerts); // Alertas actuales + preventivas
});

// Predicciones ML
socket.on("predictions", (data) => {
	console.log(data.predictions); // 6 puntos por métrica
});

// Al conectar: datos iniciales
socket.on("initial-data", (data) => {
	console.log(data.floors);
});
```

📖 **[Guía completa de WebSocket](docs/api/WEBSOCKET_GUIDE.md)**

---

## 🧪 Testing

### Con Postman

Importa la colección:

```
postman/SmartFloors.postman_collection.json
```

**35 requests organizados:**

- ✅ Health Check (1)
- ✅ Pisos (5)
- ✅ Alertas (6)
- ✅ Exportación CSV (10)
- ✅ Validaciones (13)

Cada request incluye **tests automáticos**.

### Scripts de Prueba

```bash
# Probar validaciones de schemas
bash test-validation.sh

# Probar mejoras implementadas
bash test-mejoras.sh

# Lint code
npm run lint
```

📖 **[Guía de Testing](docs/guides/POSTMAN_GUIDE.md)**

---

## 🏗️ Arquitectura

```
┌─────────────┐     WebSocket      ┌──────────────┐
│   Frontend  │ ←─────────────────→ │   Socket.IO  │
│     UI      │      Real-time     │    Server    │
└─────────────┘                     └──────────────┘
                                            │
      ↓                                     ↓
┌─────────────┐      REST API      ┌──────────────┐
│  Client App │ ←─────────────────→ │   Express    │
│             │                     │   Routes     │
└─────────────┘                     └──────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ↓                       ↓                       ↓
            ┌──────────────┐      ┌──────────────┐       ┌──────────────┐
            │  Simulator   │      │  Prediction  │       │    Alert     │
            │   Service    │─────→│   Service    │──────→│   Service    │
            │  (Singleton) │      │     (ML)     │       │  (Anomaly)   │
            └──────────────┘      └──────────────┘       └──────────────┘
                    │                     │                       │
                    └─────────────────────┴───────────────────────┘
                              In-Memory Data Store
```

**Patrón de Diseño:** Servicios Singleton compartidos entre Socket.IO y REST API.

📖 **[Arquitectura detallada](docs/development/ARCHITECTURE.md)**

---

## 🛠️ Stack Tecnológico

| Categoría        | Tecnología        | Versión | Uso                    |
| ---------------- | ----------------- | ------- | ---------------------- |
| **Runtime**      | Node.js           | 16+     | Servidor backend       |
| **Framework**    | Express.js        | 4.x     | REST API               |
| **Real-time**    | Socket.IO         | 4.x     | WebSocket              |
| **Validation**   | Joi               | 18.x    | Validación de datos    |
| **Errors**       | @hapi/boom        | 10.x    | Manejo de errores HTTP |
| **Dev**          | Nodemon           | 3.x     | Auto-reload            |
| **Code Quality** | ESLint + Prettier | Latest  | Linting y formato      |

---

## 📂 Estructura del Proyecto

```
hackaton.smartfloors.backend/
│
├── 📁 src/                           # Código fuente
│   ├── 📁 controllers/               # Controladores (lógica de endpoints)
│   │   ├── floors.controller.js
│   │   ├── export.controller.js
│   │   └── email.controller.js
│   │
│   ├── 📁 routes/                    # Definición de rutas
│   │   ├── index.js                  # Router principal
│   │   ├── floors.router.js
│   │   ├── export.router.js
│   │   └── email.router.js
│   │
│   ├── 📁 services/                  # Servicios de negocio (Singletons)
│   │   ├── simulator.services.js    # Generación de datos
│   │   ├── prediction.services.js   # ML: Predicciones
│   │   ├── alerts.services.js       # Detección de anomalías
│   │   └── email.services.js        # Notificaciones (opcional)
│   │
│   ├── 📁 schemas/                   # Validaciones Joi
│   │   ├── validator.schema.js
│   │   ├── alerts.schema.js
│   │   └── export.schema.js
│   │
│   ├── 📁 middlewares/               # Middleware personalizado
│   │   ├── validator.handler.js
│   │   └── errors.handler.js
│   │
│   ├── 📁 sockets/                   # WebSocket configuration
│   │   └── index.js                  # Socket.IO setup
│   │
│   ├── 📁 utils/                     # Utilidades
│   │   ├── helpers.js
│   │   └── csv.helpers.js
│   │
│   └── 📄 app.js                     # Configuración Express + Socket.IO
│
├── 📁 docs/                          # 📚 Documentación organizada
│   ├── 📁 guides/                    # Guías para usuarios
│   ├── 📁 api/                       # Docs de API
│   └── 📁 development/               # Docs para developers
│
├── 📁 postman/                       # Colección Postman
│   └── SmartFloors.postman_collection.json
│
├── 📄 index.js                       # Punto de entrada
├── 📄 package.json                   # Dependencias
├── 📄 .env.example                   # Template de variables
├── 📄 .eslintrc                      # Configuración ESLint
└── 📄 README.md                      # Este archivo
```

---

## ⚙️ Configuración

### Variables de Entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Configuración básica:

```env
# ===== SERVIDOR =====
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# ===== SIMULACIÓN =====
SIMULATION_INTERVAL=60000           # Intervalo en ms (60s default)
NUMBER_OF_FLOORS=5                  # Número de pisos (1-100)
BUILDING_NAME=Edificio Principal

# ===== EMAIL (Opcional) =====
EMAIL_NOTIFICATIONS_ENABLED=false
# Ver docs/development/EMAIL_SETUP.md para configurar
```

📖 **[Configuración completa](docs/development/CONFIGURATION.md)**

---

## 💡 Casos de Uso

### 1. Dashboard en Tiempo Real

```javascript
// React + Socket.IO
import { useEffect, useState } from "react";
import io from "socket.io-client";

function Dashboard() {
	const [floors, setFloors] = useState([]);
	const [alerts, setAlerts] = useState([]);

	useEffect(() => {
		const socket = io("http://localhost:3000");

		socket.on("floor-data", (data) => {
			setFloors(data.floors);
		});

		socket.on("new-alerts", (data) => {
			setAlerts((prev) => [...data.alerts, ...prev].slice(0, 10));
		});

		return () => socket.disconnect();
	}, []);

	return <div>{/* Render floors and alerts */}</div>;
}
```

### 2. Análisis de Datos Históricos

```bash
# Exportar mes completo (43,200 registros)
curl "http://localhost:3000/api/v1/export/history/csv?limit=43200" -o mes_completo.csv

# Analizar con Python
python << EOF
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('mes_completo.csv')
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Análisis por piso
df.groupby('floorId')['temperature'].mean().plot(kind='bar')
plt.show()
EOF
```

### 3. Alertas Preventivas

```javascript
// Obtener solo alertas preventivas críticas
fetch("http://localhost:3000/api/v1/alerts?type=predictive_thermal_overload&severity=critical")
	.then((res) => res.json())
	.then((data) => {
		data.data.alerts.forEach((alert) => {
			// Tomar acción ANTES de que ocurra el problema
			const minutesUntilProblem = alert.anomalies[0].minutesAhead;
			console.log(`⚠️ Sobrecarga térmica en ${minutesUntilProblem} minutos`);
			// Reducir carga preventivamente
			preventThermalOverload(alert.floorId);
		});
	});
```

---

## 🎯 Roadmap

- [x] Monitoreo en tiempo real con WebSocket
- [x] Predicciones ML (MA + LR)
- [x] Sistema de alertas (actuales + preventivas)
- [x] Exportación CSV
- [x] API REST completa
- [ ] Base de datos persistente (PostgreSQL)
- [ ] Autenticación JWT
- [ ] Dashboard web integrado
- [ ] Notificaciones por email activas
- [ ] Métricas avanzadas de ML

---

## 🤝 Contribuir

Este proyecto fue desarrollado para una hackathon. Contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Estilo

- **Código**: ESLint + Prettier configurados
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`)
- **Idioma**: Código en inglés, mensajes en español

---

## 🐛 Troubleshooting

### Puerto 3000 ocupado

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Servicios no inicializados (Error 503)

```bash
# Reiniciar servidor
npm run dev
```

### Módulos corruptos

```bash
rm -rf node_modules package-lock.json
npm install
```

### WebSocket no conecta

- Verificar CORS en `.env`
- Revisar que el servidor esté en `http://localhost:3000`
- Comprobar firewall

📖 **[Más soluciones](docs/development/TROUBLESHOOTING.md)**

---

## 📄 Licencia

Este proyecto está bajo la licencia ISC.

---

## 👥 Equipo

**SmartFloors Team** - Hackathon 2025

---

## 📬 Contacto

- 📧 Email: support@smartfloors.com
- 🐛 Issues: [GitHub Issues](https://github.com/Kevinparra535/hackaton.smartfloors.backend/issues)
- 📚 Docs: [docs/](docs/)

---

## 🔗 Enlaces Rápidos

- [📚 Documentación Completa](docs/)
- [🧪 Colección Postman](postman/SmartFloors.postman_collection.json)
- [🌐 API Reference](docs/api/API_REFERENCE.md)
- [💻 Arquitectura](docs/development/ARCHITECTURE.md)
- [⚡ Inicio Rápido](docs/guides/QUICK_START.md)

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐**

**Desarrollado con ❤️ para Hackathon 2025**

[⬆ Volver arriba](#-smartfloors---sistema-de-monitoreo-inteligente-de-edificios)

</div>
